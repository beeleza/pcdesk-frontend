import api from './client'
import type { CustomerResponse, PageParams, PageResponse } from '../types'

export interface CustomerRequest {
  name: string
  city: string
  address?: string
  contact?: string
}

export function getAll(params?: { name?: string; city?: string } & PageParams) {
  return api.get<PageResponse<CustomerResponse>>('/customers', { params }).then((r) => r.data)
}

export function create(data: CustomerRequest) {
  return api.post<CustomerResponse>('/customers', data).then((r) => r.data)
}

export function update(id: number, data: CustomerRequest) {
  return api.put<CustomerResponse>(`/customers/${id}`, data).then((r) => r.data)
}

export function remove(id: number) {
  return api.delete(`/customers/${id}`)
}
