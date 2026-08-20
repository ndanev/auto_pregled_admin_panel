import type { Brand } from './brand'

export interface CarModel {
  id: number
  brand_id: number
  name: string
  slug: string
  brand: Brand
  generations_count: number | null
  created_at: string
  updated_at: string
}

export interface ModelFormData {
  brand_id: number | null
  name: string
  slug: string
}