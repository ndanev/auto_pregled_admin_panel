import api from '@/lib/axios'
import type { Generation, GenerationFormData } from '@/types/generation'

export async function fetchGenerations(modelId?: number): Promise<Generation[]> {
  const response = await api.get('/api/admin/generations', {
    params: modelId ? { model_id: modelId } : {},
  })
  return response.data.data
}

export async function fetchGeneration(id: number): Promise<Generation> {
  const response = await api.get(`/api/admin/generations/${id}`)
  return response.data.data
}

export async function createGeneration(payload: GenerationFormData): Promise<Generation> {
  const response = await api.post('/api/admin/generations', payload)
  return response.data.data
}

export async function updateGeneration(id: number, payload: GenerationFormData): Promise<Generation> {
  const response = await api.put(`/api/admin/generations/${id}`, payload)
  return response.data.data
}

export async function deleteGeneration(id: number): Promise<void> {
  await api.delete(`/api/admin/generations/${id}`)
}