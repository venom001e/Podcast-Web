import { z } from 'zod';
import { insertPodcastSchema, podcasts } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  podcasts: {
    list: {
      method: 'GET' as const,
      path: '/api/podcasts' as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof podcasts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/podcasts/:id' as const,
      responses: {
        200: z.custom<typeof podcasts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // For demo purposes, we might want to create podcasts via API, or just seed them.
    // I'll add a create endpoint just in case, but primary usage is read.
    create: {
      method: 'POST' as const,
      path: '/api/podcasts' as const,
      input: insertPodcastSchema,
      responses: {
        201: z.custom<typeof podcasts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  users: {
    subscribe: {
      method: 'POST' as const,
      path: '/api/users/subscribe' as const,
      responses: {
        200: z.object({ isSubscribed: z.boolean() }),
        401: errorSchemas.notFound, // unauthorized
      },
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
