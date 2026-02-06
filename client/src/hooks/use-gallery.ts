import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertGalleryItem, type GalleryItem } from "@shared/schema";

export function useGallery() {
  return useQuery({
    queryKey: [api.gallery.list.path],
    queryFn: async () => {
      console.log('[useGallery] Fetching gallery');
      const res = await fetch(api.gallery.list.path, { credentials: "include" });
      console.log('[useGallery] Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.log('[useGallery] Error response:', errorText);
        throw new Error("Failed to fetch gallery");
      }
      const json = await res.json();
      console.log('[useGallery] Got items:', json?.length);
      return api.gallery.list.responses[200].parse(json);
    },
  });
}

export function useAddToGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGalleryItem) => {
      console.log('[useAddToGallery] Starting save');
      try {
        const validated = api.gallery.create.input.parse(data);
        const res = await fetch(api.gallery.create.path, {
          method: api.gallery.create.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
          credentials: "include",
        });
        console.log('[useAddToGallery] Response status:', res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.log('[useAddToGallery] Error response:', errorText);
          throw new Error("Failed to save to gallery: " + errorText);
        }
        const json = await res.json();
        console.log('[useAddToGallery] Success, item id:', json.id);
        return api.gallery.create.responses[201].parse(json);
      } catch (err) {
        console.error('[useAddToGallery] Error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log('[useAddToGallery] Invalidating gallery cache');
      queryClient.invalidateQueries({ queryKey: [api.gallery.list.path] });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.gallery.delete.path, { id });
      const res = await fetch(url, {
        method: api.gallery.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.gallery.list.path] }),
  });
}
