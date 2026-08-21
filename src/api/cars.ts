import api from '@/lib/axios'
import type { Car, CarFormData, CarStatus } from '@/types/car'

export async function fetchCars(filters?: { generationId?: number; status?: CarStatus }): Promise<Car[]> {
  const response = await api.get('/api/admin/cars', {
    params: {
      generation_id: filters?.generationId,
      status: filters?.status,
    },
  })
  return response.data.data
}

export async function fetchCar(id: number): Promise<Car> {
  const response = await api.get(`/api/admin/cars/${id}`)
  return response.data.data
}

export async function createCar(payload: CarFormData): Promise<Car> {
  const response = await api.post('/api/admin/cars', payload)
  return response.data.data
}

export async function updateCar(id: number, payload: CarFormData): Promise<Car> {
  const response = await api.put(`/api/admin/cars/${id}`, payload)
  return response.data.data
}

export async function deleteCar(id: number): Promise<void> {
  await api.delete(`/api/admin/cars/${id}`)
}