import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import { authStorage } from "./storage";

const STRATEGY_NAME = "oidc";

function getBaseUrl(): string {
  const base = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base) {
    throw new Error("BASE_URL must be set (e.g. http://localhost:5000 or https://yourdomain.com)");
  }
  return base;
}

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL;
    const clientId = process.env.OIDC_CLIENT_ID;
    const clientSecret = process.env.OIDC_CLIENT_SECRET;
    if (!issuerUrl || !clientId) {
      throw new Error("ISSUER_URL and OIDC_CLIENT_ID must be set for OIDC auth");
    }
    return await client.discovery(
      new URL(issuerUrl),
      clientId,
      clientSecret ?? undefined
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const mongoUrl = process.env.MONGODB_URI ?? process.env.DATABASE_URL;
  if (!mongoUrl) {
    throw new Error("MONGODB_URI or DATABASE_URL must be set for session store");
  }
  const sessionStore = MongoStore.create({
    mongoUrl,
    dbName: "procam",
    ttl: Math.floor(sessionTtl / 1000),
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();
  const baseUrl = getBaseUrl();
  const callbackURL = `${baseUrl}/api/callback`;

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const strategy = new Strategy(
    {
      name: STRATEGY_NAME,
      config,
      scope: "openid email profile offline_access",
      callbackURL,
    },
    verify
  );
  passport.use(strategy);

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(STRATEGY_NAME, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(STRATEGY_NAME, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      const clientId = process.env.OIDC_CLIENT_ID!;
      const postLogoutRedirect = process.env.BASE_URL?.replace(/\/$/, "") ?? `${req.protocol}://${req.get("host")}`;
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: clientId,
          post_logout_redirect_uri: postLogoutRedirect,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
