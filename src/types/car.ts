import type { Generation } from './generation'
import type { Engine } from './engine'

export type Transmission = 'manuelni' | 'automatski' | 'dsg_cvt'
export type Drivetrain = 'prednji' | 'zadnji' | '4x4'
export type BodyType = 'hecbek' | 'limuzina' | 'karavan' | 'suv' | 'kupe' | 'kabriolet'
export type CarStatus = 'draft' | 'published'

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manuelni: 'Manuelni',
  automatski: 'Automatski',
  dsg_cvt: 'DSG/CVT',
}

export const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  prednji: 'Prednji',
  zadnji: 'Zadnji',
  '4x4': '4x4',
}

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  hecbek: 'Hečbek',
  limuzina: 'Limuzina',
  karavan: 'Karavan',
  suv: 'SUV',
  kupe: 'Kupe',
  kabriolet: 'Kabriolet',
}

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  draft: 'Nacrt',
  published: 'Objavljeno',
}

export interface Car {
  id: number
  generation_id: number
  engine_id: number
  transmission: Transmission
  drivetrain: Drivetrain | null
  body_type: BodyType | null
  status: CarStatus
  slug: string
  meta_title: string | null
  meta_description: string | null
  generation: Generation
  engine: Engine
  images_count: number | null
  has_ai_analysis: boolean
  created_at: string
  updated_at: string
}

export interface CarFormData {
  generation_id: number | null
  engine_id: number | null
  transmission: Transmission | null
  drivetrain: Drivetrain | null
  body_type: BodyType | null
  status: CarStatus
  meta_title: string | null
  meta_description: string | null
}