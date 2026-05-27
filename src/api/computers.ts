import api from './client'
import type { ComputerResponse, PageParams, PageResponse } from '../types'

export interface ComputerRequest {
  assetTag: string
  motherboard?: string
  processor?: string
  ramGb?: number
  storageGb?: number
  storageType?: string
  gpu?: string
  operatingSystem?: string
  status?: string
}

export function getAll(params?: { status?: string; assetTag?: string } & PageParams) {
  return api.get<PageResponse<ComputerResponse>>('/computers', { params }).then((r) => r.data)
}

export function create(data: ComputerRequest) {
  return api.post<ComputerResponse>('/computers', data).then((r) => r.data)
}

export function update(id: number, data: ComputerRequest) {
  return api.put<ComputerResponse>(`/computers/${id}`, data).then((r) => r.data)
}

export function remove(id: number) {
  return api.delete(`/computers/${id}`)
}
