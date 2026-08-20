import api from '@/lib/axios'
import type { CarModel, ModelFormData } from '@/types/model'

export async function fetchModels(brandId?: number): Promise<CarModel[]> {
  const response = await api.get('/api/admin/models', {
    params: brandId ? { brand_id: brandId } : {},
  })
  return response.data.data
}

export async function fetchModel(id: number): Promise<CarModel> {
  const response = await api.get(`/api/admin/models/${id}`)
  return response.data.data
}

export async function createModel(payload: ModelFormData): Promise<CarModel> {
  const response = await api.post('/api/admin/models', payload)
  return response.data.data
}

export async function updateModel(id: number, payload: ModelFormData): Promise<CarModel> {
  const response = await api.put(`/api/admin/models/${id}`, payload)
  return response.data.data
}

export async function deleteModel(id: number): Promise<void> {
  await api.delete(`/api/admin/models/${id}`)
}