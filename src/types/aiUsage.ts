export interface AiUsageStats {
  total_requests: number
  total_requests_30d: number
  total_tokens_30d: number
  estimated_cost_30d_usd: number
  failed_requests_30d: number
  recent_requests: {
    id: number
    car_label: string
    status: 'success' | 'failed'
    total_tokens: number
    estimated_cost_usd: number
    created_at: string
  }[]
}