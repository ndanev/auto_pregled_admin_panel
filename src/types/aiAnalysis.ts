export interface AiAnalysis {
  id: number
  car_id: number
  content: Record<string, unknown>
  overall_rating: number | null
  reliability_score: number | null
  has_insufficient_data: boolean
  updated_at: string
}