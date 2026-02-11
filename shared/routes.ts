import { z } from 'zod';
import { insertPodcastSchema, podcasts, users } from './schema';

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
  forbidden: z.object({
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
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalPodcasts: z.number(),
          totalPremiumPodcasts: z.number(),
        }),
        403: errorSchemas.forbidden,
      },
    },
    podcasts: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/podcasts' as const,
        responses: {
          200: z.array(z.custom<typeof podcasts.$inferSelect>()),
          403: errorSchemas.forbidden,
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/podcasts/:id' as const,
        input: insertPodcastSchema.partial(),
        responses: {
          200: z.custom<typeof podcasts.$inferSelect>(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/podcasts/:id' as const,
        responses: {
          204: z.void(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
          403: errorSchemas.forbidden,
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/users/:id' as const,
        input: z.object({
          role: z.enum(["user", "admin"]).optional(),
          isSubscribed: z.boolean().optional(),
        }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/users/:id' as const,
        responses: {
          204: z.void(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
  },
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
