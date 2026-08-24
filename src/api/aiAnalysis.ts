import api from '@/lib/axios'
import type { AiAnalysis } from '@/types/aiAnalysis'

export async function generateAiAnalysis(carId: number): Promise<AiAnalysis> {
  const response = await api.post(`/api/admin/cars/${carId}/generate-analysis`)
  return response.data.data
}