import { z } from 'zod';
import { insertPresetSchema, insertGallerySchema, type Preset, type GalleryItem } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  presets: {
    list: {
      method: 'GET' as const,
      path: '/api/presets',
      responses: { 200: z.array(z.custom<Preset>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/presets',
      input: insertPresetSchema,
      responses: { 201: z.custom<Preset>(), 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/presets/:id',
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
  gallery: {
    list: {
      method: 'GET' as const,
      path: '/api/gallery',
      responses: { 200: z.array(z.custom<GalleryItem>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/gallery',
      input: insertGallerySchema,
      responses: { 201: z.custom<GalleryItem>(), 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/gallery/:id',
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
  // Stripe related endpoints
  stripe: {
     products: {
         list: {
             method: 'GET' as const,
             path: '/api/products-with-prices',
             responses: { 200: z.any() }
         }
     },
     checkout: {
         create: {
             method: 'POST' as const,
             path: '/api/checkout',
             input: z.object({ priceId: z.string() }),
             responses: { 200: z.object({ url: z.string() }) }
         }
     },
     subscription: {
         get: {
             method: 'GET' as const,
             path: '/api/subscription',
             responses: { 200: z.object({ subscription: z.any() }) }
         }
     },
     portal: {
         create: {
             method: 'POST' as const,
             path: '/api/billing-portal',
             responses: { 200: z.object({ url: z.string() }) }
         }
     }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
