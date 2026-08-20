import api from '@/lib/axios'
import type { Brand, BrandFormData } from '@/types/brand'

export async function fetchBrands(): Promise<Brand[]> {
  const response = await api.get('/api/admin/brands')
  return response.data.data
}

export async function fetchBrand(id: number): Promise<Brand> {
  const response = await api.get(`/api/admin/brands/${id}`)
  return response.data.data
}

export async function createBrand(payload: BrandFormData): Promise<Brand> {
  const response = await api.post('/api/admin/brands', payload)
  return response.data.data
}

export async function updateBrand(id: number, payload: BrandFormData): Promise<Brand> {
  const response = await api.put(`/api/admin/brands/${id}`, payload)
  return response.data.data
}

export async function deleteBrand(id: number): Promise<void> {
  await api.delete(`/api/admin/brands/${id}`)
}