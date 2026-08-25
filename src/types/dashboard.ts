export interface DashboardStats {
  total_brands: number
  total_models: number
  total_generations: number
  total_engines: number
  total_cars: number
  published_cars: number
  draft_cars: number
  total_images: number
  cars_with_ai_analysis: number
  cars_per_month: { label: string; count: number }[]
}