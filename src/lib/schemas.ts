import { z } from 'zod'

export const appBody = z.object({
  name: z.string().trim().min(1).max(100),
})

/** The contract Papyrus Compiler App sends: keep it backward compatible. */
export const eventBody = z.object({
  type: z.string().trim().min(1).max(100),
  appKey: z.string().min(1),
  properties: z
    .record(z.string(), z.unknown())
    .default({})
    .refine(value => JSON.stringify(value).length <= 16_384, 'properties must be at most 16 KB of JSON'),
})

export const eventsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  type: z.string().trim().max(100).optional(),
})
