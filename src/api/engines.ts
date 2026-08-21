import api from '@/lib/axios'
import type { Engine, EngineFormData } from '@/types/engine'

export async function fetchEngines(generationId?: number): Promise<Engine[]> {
  const response = await api.get('/api/admin/engines', {
    params: generationId ? { generation_id: generationId } : {},
  })
  return response.data.data
}

export async function fetchEngine(id: number): Promise<Engine> {
  const response = await api.get(`/api/admin/engines/${id}`)
  return response.data.data
}

export async function createEngine(payload: EngineFormData): Promise<Engine> {
  const response = await api.post('/api/admin/engines', payload)
  return response.data.data
}

export async function updateEngine(id: number, payload: EngineFormData): Promise<Engine> {
  const response = await api.put(`/api/admin/engines/${id}`, payload)
  return response.data.data
}

export async function deleteEngine(id: number): Promise<void> {
  await api.delete(`/api/admin/engines/${id}`)
}