import { useEffect, useState } from 'react'
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { ComputerResponse, OrderType, ServiceOrderResponse } from '../types'
import * as computersApi from '../api/computers'
import * as customersApi from '../api/customers'
import * as serviceOrdersApi from '../api/serviceOrders'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const statusLabel: Record<string, string> = {
  available: 'Disponível',
  allocated: 'Alocado',
  maintenance: 'Manutenção',
  retired: 'Baixado',
}

const statusColor: Record<string, string> = {
  available: '#22c55e',
  allocated: '#3b82f6',
  maintenance: '#f59e0b',
  retired: '#6b7280',
}

const orderTypeLabel: Record<OrderType, string> = {
  delivery: 'Entrega',
  return: 'Devolução',
  maintenance: 'Manutenção',
}

const orderTypeColor: Record<OrderType, { bg: string; color: string }> = {
  delivery: { bg: '#dbeafe', color: '#1d4ed8' },
  return: { bg: '#dcfce7', color: '#16a34a' },
  maintenance: { bg: '#fef3c7', color: '#d97706' },
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number
  label: string
  color: string
  loading: boolean
  icon: React.ReactNode
}

function StatCard({ value, label, color, loading, icon }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {icon}
        </svg>
      </Box>
      <Box>
        {loading ? (
          <Skeleton width={56} height={44} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }} color="text.primary">
            {value}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

interface Counts {
  available: number
  allocated: number
  maintenance: number
  retired: number
  customers: number
  openOrders: number
}

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>({
    available: 0,
    allocated: 0,
    maintenance: 0,
    retired: 0,
    customers: 0,
    openOrders: 0,
  })
  const [maintenanceComputers, setMaintenanceComputers] = useState<ComputerResponse[]>([])
  const [openOrders, setOpenOrders] = useState<ServiceOrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      computersApi.getAll({ status: 'available', page: 0, size: 1 }),
      computersApi.getAll({ status: 'allocated', page: 0, size: 1 }),
      computersApi.getAll({ status: 'maintenance', page: 0, size: 6 }),
      computersApi.getAll({ status: 'retired', page: 0, size: 1 }),
      customersApi.getAll({ page: 0, size: 1 }),
      serviceOrdersApi.getAll({ open: true, page: 0, size: 8 }),
    ]).then(([avail, alloc, maint, ret, custs, orders]) => {
      setCounts({
        available: avail.status === 'fulfilled' ? avail.value.totalElements : 0,
        allocated: alloc.status === 'fulfilled' ? alloc.value.totalElements : 0,
        maintenance: maint.status === 'fulfilled' ? maint.value.totalElements : 0,
        retired: ret.status === 'fulfilled' ? ret.value.totalElements : 0,
        customers: custs.status === 'fulfilled' ? custs.value.totalElements : 0,
        openOrders: orders.status === 'fulfilled' ? orders.value.totalElements : 0,
      })
      if (maint.status === 'fulfilled') setMaintenanceComputers(maint.value.content)
      if (orders.status === 'fulfilled') setOpenOrders(orders.value.content)
      setLoading(false)
    })
  }, [])

  const stats: Omit<StatCardProps, 'loading'>[] = [
    {
      value: counts.available,
      label: 'Disponíveis',
      color: '#22c55e',
      icon: (
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      value: counts.allocated,
      label: 'Alocados',
      color: '#3b82f6',
      icon: (
        <path
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      value: counts.maintenance,
      label: 'Em Manutenção',
      color: '#f59e0b',
      icon: (
        <path
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      value: counts.retired,
      label: 'Baixados',
      color: '#6b7280',
      icon: (
        <path
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      value: counts.openOrders,
      label: 'Ordens Abertas',
      color: '#aa3bff',
      icon: (
        <>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ),
    },
    {
      value: counts.customers,
      label: 'Clientes',
      color: '#06b6d4',
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
  ]

  return (
    <Box>
      {/* KPI cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2.5,
          mb: 3,
          '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
          '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </Box>

      {/* Bottom row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 3,
          '@media (max-width: 900px)': { gridTemplateColumns: '1fr' },
        }}
      >
        {/* Open orders table */}
        <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
              Ordens de Serviço Abertas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pendentes de encerramento
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={40} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : openOrders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                Nenhuma ordem aberta no momento.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Nº da Ordem', 'Tipo', 'Abertura', 'Observações'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem' }}>
                        {h.toUpperCase()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openOrders.map((order) => {
                    const tc = orderTypeColor[order.type as OrderType] ?? { bg: '#f3f4f6', color: '#6b7280' }
                    return (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={orderTypeLabel[order.type as OrderType] ?? order.type}
                            size="small"
                            sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {fmtDate(order.openedAt)}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.85rem',
                            maxWidth: 160,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order.notes ?? '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Computers in maintenance */}
        <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
              Computadores em Manutenção
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Requerem atenção
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={56} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Box>
          ) : maintenanceComputers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                Nenhum computador em manutenção.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {maintenanceComputers.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: '#fffbeb',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: statusColor[c.status],
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontFamily: 'monospace', lineHeight: 1.2 }}
                    >
                      {c.assetTag}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {[c.processor, c.ramGb ? `${c.ramGb}GB RAM` : null]
                        .filter(Boolean)
                        .join(' · ') || 'Sem especificações'}
                    </Typography>
                  </Box>
                  <Chip
                    label={statusLabel[c.status]}
                    size="small"
                    sx={{
                      bgcolor: `${statusColor[c.status]}18`,
                      color: statusColor[c.status],
                      border: `1px solid ${statusColor[c.status]}40`,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
