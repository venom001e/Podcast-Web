import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Podcast, InsertPodcast } from "@shared/schema";

export function usePodcasts(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: [api.podcasts.list.path, params],
    queryFn: async () => {
      const url = new URL(api.podcasts.list.path, window.location.origin);
      if (params?.category) url.searchParams.append("category", params.category);
      if (params?.search) url.searchParams.append("search", params.search);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch podcasts");
      
      const data = await res.json();
      return api.podcasts.list.responses[200].parse(data);
    },
  });
}

export function usePodcast(id: number) {
  return useQuery({
    queryKey: [api.podcasts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.podcasts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch podcast");
      
      const data = await res.json();
      return api.podcasts.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

// For completeness, though likely admin only
export function useCreatePodcast() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertPodcast) => {
      const res = await fetch(api.podcasts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) throw new Error("Validation failed");
        throw new Error("Failed to create podcast");
      }
      
      const json = await res.json();
      return api.podcasts.create.responses[201].parse(json);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.podcasts.list.path] });
    },
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.users.subscribe.path, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Subscription failed");
      
      const json = await res.json();
      return api.users.subscribe.responses[200].parse(json);
    },
    onSuccess: () => {
      // Invalidate user query to refresh subscription status in UI
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}
