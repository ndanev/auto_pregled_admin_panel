export interface Brand {
  id: number
  name: string
  slug: string
  logo_path: string | null
  logo_url: string | null
  models_count: number | null
  created_at: string
  updated_at: string
}

export interface BrandFormData {
  name: string
  slug: string
}