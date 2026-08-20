import type { CarModel } from './model'

export interface Generation {
  id: number
  model_id: number
  name: string
  slug: string
  year_start: number
  year_end: number | null
  model: CarModel
  engines_count: number | null
  cars_count: number | null
  created_at: string
  updated_at: string
}

export interface GenerationFormData {
  model_id: number | null
  name: string
  slug: string
  year_start: number | null
  year_end: number | null
}