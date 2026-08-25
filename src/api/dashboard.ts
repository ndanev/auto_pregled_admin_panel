import api from '@/lib/axios'
import type { DashboardStats } from '@/types/dashboard'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/api/admin/dashboard/stats')
  return response.data.data
}