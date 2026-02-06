import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPreset, type Preset } from "@shared/schema";

export function usePresets() {
  return useQuery({
    queryKey: [api.presets.list.path],
    queryFn: async () => {
      const res = await fetch(api.presets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch presets");
      return api.presets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPreset) => {
      const validated = api.presets.create.input.parse(data);
      const res = await fetch(api.presets.create.path, {
        method: api.presets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Invalid preset data");
        }
        throw new Error("Failed to create preset");
      }
      return api.presets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.presets.list.path] }),
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.presets.delete.path, { id });
      const res = await fetch(url, {
        method: api.presets.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete preset");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.presets.list.path] }),
  });
}
