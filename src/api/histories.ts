import api from './client'
import type { HistoryResponse, PageParams, PageResponse } from '../types'

export interface HistoryRequest {
  computerId: number
  customerId?: number | null
  serviceOrderId?: number | null
  startedAt: string
  endedAt?: string | null
  notes?: string
}

export function getAll(
  params?: { computerId?: number; customerId?: number; serviceOrderId?: number } & PageParams,
) {
  return api.get<PageResponse<HistoryResponse>>('/histories', { params }).then((r) => r.data)
}

export function create(data: HistoryRequest) {
  return api.post<HistoryResponse>('/histories', data).then((r) => r.data)
}

export function close(id: number) {
  return api.patch<HistoryResponse>(`/histories/${id}/close`).then((r) => r.data)
}

export function remove(id: number) {
  return api.delete(`/histories/${id}`)
}
