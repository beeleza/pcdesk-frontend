export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}

export interface AuthResponse {
  token: string
  name: string
  email: string
}

export type ComputerStatus = 'available' | 'allocated' | 'maintenance' | 'retired'
export type OrderType = 'delivery' | 'return' | 'maintenance'

export interface CustomerResponse {
  id: number
  name: string
  city: string
  address?: string
  contact?: string
  createdAt: string
}

export interface ComputerResponse {
  id: number
  assetTag: string
  motherboard?: string
  processor?: string
  ramGb?: number
  storageGb?: number
  storageType?: string
  gpu?: string
  operatingSystem?: string
  status: ComputerStatus
  createdAt: string
}

export interface ServiceOrderResponse {
  id: number
  orderNumber: string
  type: OrderType
  openedAt: string
  closedAt?: string
  notes?: string
  createdAt: string
  computer?: ComputerResponse
}

export interface HistoryResponse {
  id: number
  computer: ComputerResponse
  customer?: CustomerResponse
  serviceOrder?: ServiceOrderResponse
  startedAt: string
  endedAt?: string
  notes?: string
  createdAt: string
}
