import type { Generation } from './generation'

export type FuelType = 'benzin' | 'dizel' | 'hibrid' | 'plug_in_hibrid' | 'elektro'

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  hibrid: 'Hibrid',
  plug_in_hibrid: 'Plug-in hibrid',
  elektro: 'Elektro',
}

export interface Engine {
  id: number
  generation_id: number
  name: string
  fuel_type: FuelType
  displacement_cc: number | null
  power_hp: number | null
  torque_nm: number | null
  generation: Generation
  cars_count: number | null
  created_at: string
  updated_at: string
}

export interface EngineFormData {
  generation_id: number | null
  name: string
  fuel_type: FuelType | null
  displacement_cc: number | null
  power_hp: number | null
  torque_nm: number | null
}