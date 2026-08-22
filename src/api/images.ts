import api from '@/lib/axios'
import type { CarImage } from '@/types/image'

export async function fetchImages(carId: number): Promise<CarImage[]> {
  const response = await api.get(`/api/admin/cars/${carId}/images`)
  return response.data.data
}

export async function uploadImages(carId: number, files: File[]): Promise<CarImage[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('images[]', file))

  const response = await api.post(`/api/admin/cars/${carId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}

export async function setMainImage(imageId: number): Promise<CarImage> {
  const response = await api.put(`/api/admin/images/${imageId}`, { is_main: true })
  return response.data.data
}

export async function reorderImages(carId: number, imageIds: number[]): Promise<void> {
  await api.post(`/api/admin/cars/${carId}/images/reorder`, { image_ids: imageIds })
}

export async function deleteImage(imageId: number): Promise<void> {
  await api.delete(`/api/admin/images/${imageId}`)
}