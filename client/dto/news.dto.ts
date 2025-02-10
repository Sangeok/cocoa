import { z } from 'zod'

// Market data schema
export const MarketDataSchema = z.object({
  volume: z.number(),
  priceChange: z.number(),
  currentPrice: z.number()
})

export const NewsDataSchema = z.object({
  title: z.string(),
  url: z.string(),
  source: z.string(),
  publishedAt: z.string(),
})

// News schema
export const NewsSchema = z.object({
  id: z.string(),
  title: z.string(),
  symbol: z.string(),
  content: z.string(),
  timestamp: z.string(),
  marketData: MarketDataSchema,
  newsData: z.array(NewsDataSchema).optional(),
})

// Create news request schema
export const CreateNewsSchema = NewsSchema.omit({ 
  id: true,
  timestamp: true 
})

// Update news request schema
export const UpdateNewsSchema = CreateNewsSchema.partial()

// Response schemas
export const NewsResponseSchema = NewsSchema
export const NewsListResponseSchema = z.array(NewsSchema)

// Infer types from schemas
export type MarketData = z.infer<typeof MarketDataSchema>
export type News = z.infer<typeof NewsSchema>
export type CreateNewsRequest = z.infer<typeof CreateNewsSchema>
export type UpdateNewsRequest = z.infer<typeof UpdateNewsSchema>
export type NewsResponse = z.infer<typeof NewsResponseSchema>
export type NewsListResponse = z.infer<typeof NewsListResponseSchema>

// Query params schema
export const NewsQuerySchema = z.object({
  symbol: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type NewsQueryParams = z.infer<typeof NewsQuerySchema> 