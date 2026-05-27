import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import type { ComputerResponse, CustomerResponse, HistoryResponse, ServiceOrderResponse } from '../types'
import * as historiesApi from '../api/histories'
import type { HistoryRequest } from '../api/histories'
import * as computersApi from '../api/computers'
import * as customersApi from '../api/customers'
import * as ordersApi from '../api/serviceOrders'
import ConfirmDialog from '../components/ConfirmDialog'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fromInput(val: string) {
  return val ? `${val}:00` : ''
}

const now = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

const EMPTY_FORM = {
  computerId: '' as number | '',
  customerId: null as number | null,
  serviceOrderId: null as number | null,
  startedAt: now(),
  endedAt: null as string | null,
  notes: '',
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Histories() {
  const [items, setItems] = useState<HistoryResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [closing, setClosing] = useState<number | null>(null)
  const [version, setVersion] = useState(0)

  // Dropdown data for the form (load once)
  const [computers, setComputers] = useState<ComputerResponse[]>([])
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderResponse[]>([])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [closeId, setCloseId] = useState<number | null>(null)

  // Load dropdown data once
  useEffect(() => {
    Promise.allSettled([
      computersApi.getAll({ page: 0, size: 1000 }),
      customersApi.getAll({ page: 0, size: 1000 }),
      ordersApi.getAll({ page: 0, size: 1000 }),
    ]).then(([comp, cust, ord]) => {
      if (comp.status === 'fulfilled') setComputers(comp.value.content)
      if (cust.status === 'fulfilled') setCustomers(cust.value.content)
      if (ord.status === 'fulfilled') setServiceOrders(ord.value.content)
    })
  }, [])

  // Fetch paginated histories
  useEffect(() => {
    setLoading(true)
    historiesApi
      .getAll({ page, size: rowsPerPage })
      .then((data) => {
        // Client-side status filter since the API doesn't have an "active" filter
        const all = data.content
        const filtered =
          statusFilter === 'active'
            ? all.filter((h) => !h.endedAt)
            : statusFilter === 'closed'
              ? all.filter((h) => !!h.endedAt)
              : all
        setItems(filtered)
        setTotal(data.totalElements)
      })
      .finally(() => setLoading(false))
  }, [page, rowsPerPage, statusFilter, version])

  const refresh = () => setVersion((v) => v + 1)

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, startedAt: now() })
    setDialogOpen(true)
  }

  function closeDialog() {
    if (saving) return
    setDialogOpen(false)
  }

  async function handleSubmit() {
    if (!form.computerId) return
    setSaving(true)
    try {
      const payload: HistoryRequest = {
        computerId: form.computerId as number,
        customerId: form.customerId || null,
        serviceOrderId: form.serviceOrderId || null,
        startedAt: fromInput(form.startedAt),
        endedAt: form.endedAt ? fromInput(form.endedAt) : null,
        notes: form.notes || undefined,
      }
      await historiesApi.create(payload)
      closeDialog()
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleClose() {
    if (!closeId) return
    setClosing(closeId)
    try {
      await historiesApi.close(closeId)
      setCloseId(null)
      refresh()
    } finally {
      setClosing(null)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await historiesApi.remove(deleteId)
      setDeleteId(null)
      if (items.length === 1 && page > 0) setPage((p) => p - 1)
      else refresh()
    } finally {
      setDeleting(false)
    }
  }

  function handleRowsPerPageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Situação</InputLabel>
          <Select
            value={statusFilter}
            label="Situação"
            onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'active' | 'closed'); setPage(0) }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Ativos</MenuItem>
            <MenuItem value="closed">Encerrados</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          disableElevation
          onClick={openCreate}
          sx={{
            background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #bb5cff 0%, #8e32e8 100%)' },
            whiteSpace: 'nowrap',
          }}
        >
          Novo Histórico
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                {['Computador', 'Cliente', 'Ordem de Serviço', 'Início', 'Fim', 'Situação', ''].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem', py: 1.5, letterSpacing: 0.5 }}>
                    {h.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(rowsPerPage)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton height={24} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    Nenhum histórico encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((h) => {
                  const isActive = !h.endedAt
                  return (
                    <TableRow key={h.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {h.computer.assetTag}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {h.customer?.name ?? '—'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {h.serviceOrder?.orderNumber ?? '—'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {fmtDate(h.startedAt)}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {fmtDate(h.endedAt)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isActive ? 'Ativo' : 'Encerrado'}
                          size="small"
                          sx={{
                            bgcolor: isActive ? '#dcfce7' : '#f3f4f6',
                            color: isActive ? '#16a34a' : '#6b7280',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {isActive && (
                          <Tooltip title="Encerrar alocação">
                            <IconButton size="small" onClick={() => setCloseId(h.id)} sx={{ mr: 0.5, color: '#22c55e' }} disabled={closing === h.id}>
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteId(h.id)} sx={{ color: '#ef4444' }}>
                            <TrashIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        />
      </Paper>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Novo Histórico de Alocação</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Computador *</InputLabel>
              <Select
                value={form.computerId}
                label="Computador *"
                onChange={(e) => setField('computerId', e.target.value as number)}
              >
                {computers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.assetTag}{c.processor ? ` — ${c.processor}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={form.customerId ?? ''}
                label="Cliente"
                onChange={(e) => setField('customerId', e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} — {c.city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Ordem de Serviço</InputLabel>
              <Select
                value={form.serviceOrderId ?? ''}
                label="Ordem de Serviço"
                onChange={(e) => setField('serviceOrderId', e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">Nenhuma</MenuItem>
                {serviceOrders.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.orderNumber} — {o.type === 'delivery' ? 'Entrega' : o.type === 'return' ? 'Devolução' : 'Manutenção'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Início *" type="datetime-local" value={form.startedAt} onChange={(e) => setField('startedAt', e.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Fim" type="datetime-local" value={form.endedAt ?? ''} onChange={(e) => setField('endedAt', e.target.value || null)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
            </Box>

            <TextField label="Observações" value={form.notes ?? ''} onChange={(e) => setField('notes', e.target.value)} size="small" multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={saving || !form.computerId}
            sx={{ background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!closeId} title="Encerrar alocação" description="Deseja encerrar esta alocação? A data/hora atual será registrada como fim." onConfirm={handleClose} onClose={() => setCloseId(null)} loading={!!closing} />
      <ConfirmDialog open={!!deleteId} title="Excluir histórico" description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita." onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting} />
    </Box>
  )
}
