import api from '@/lib/axios'
import type { AiUsageStats } from '@/types/aiUsage'

export async function fetchAiUsageStats(): Promise<AiUsageStats> {
  const response = await api.get('/api/admin/ai-usage/stats')
  return response.data.data
}