import api from './client'
import type { PageParams, PageResponse, ServiceOrderResponse } from '../types'

export interface ServiceOrderRequest {
  orderNumber: string
  type: string
  openedAt: string
  closedAt?: string
  notes?: string
  computerId?: number
}

export function getAll(params?: { type?: string; orderNumber?: string; open?: boolean } & PageParams) {
  return api.get<PageResponse<ServiceOrderResponse>>('/service-orders', { params }).then((r) => r.data)
}

export function create(data: ServiceOrderRequest) {
  return api.post<ServiceOrderResponse>('/service-orders', data).then((r) => r.data)
}

export function update(id: number, data: ServiceOrderRequest) {
  return api.put<ServiceOrderResponse>(`/service-orders/${id}`, data).then((r) => r.data)
}

export function close(id: number) {
  return api.patch<ServiceOrderResponse>(`/service-orders/${id}/close`).then((r) => r.data)
}

export function remove(id: number) {
  return api.delete(`/service-orders/${id}`)
}
