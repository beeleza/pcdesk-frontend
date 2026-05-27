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
  InputAdornment,
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
import type { OrderType, ServiceOrderResponse } from '../types'
import * as ordersApi from '../api/serviceOrders'
import type { ServiceOrderRequest } from '../api/serviceOrders'
import ConfirmDialog from '../components/ConfirmDialog'

// ── constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<OrderType, string> = {
  delivery: 'Entrega',
  return: 'Devolução',
  maintenance: 'Manutenção',
}

const TYPE_COLORS: Record<OrderType, { bg: string; color: string }> = {
  delivery: { bg: '#dbeafe', color: '#1d4ed8' },
  return: { bg: '#dcfce7', color: '#16a34a' },
  maintenance: { bg: '#fef3c7', color: '#d97706' },
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fromInput(val: string) {
  return val ? `${val}:00` : ''
}

const now = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

const EMPTY_FORM: ServiceOrderRequest = { orderNumber: '', type: 'delivery', openedAt: now(), notes: '' }

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseOrderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ServiceOrders() {
  const [items, setItems] = useState<ServiceOrderResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [closing, setClosing] = useState<number | null>(null)
  const [version, setVersion] = useState(0)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<OrderType | ''>('')
  const [showOpen, setShowOpen] = useState<'all' | 'open' | 'closed'>('all')

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; id?: number }>({
    open: false,
    mode: 'create',
  })
  const [form, setForm] = useState<ServiceOrderRequest>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [closeId, setCloseId] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    ordersApi
      .getAll({
        page,
        size: rowsPerPage,
        orderNumber: debouncedSearch || undefined,
        type: typeFilter || undefined,
        open: showOpen === 'open' ? true : showOpen === 'closed' ? false : undefined,
      })
      .then((data) => {
        setItems(data.content)
        setTotal(data.totalElements)
      })
      .finally(() => setLoading(false))
  }, [page, rowsPerPage, debouncedSearch, typeFilter, showOpen, version])

  const refresh = () => setVersion((v) => v + 1)

  function setField<K extends keyof ServiceOrderRequest>(key: K, value: ServiceOrderRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleFilterChange<T>(setter: (v: T) => void) {
    return (value: T) => { setter(value); setPage(0) }
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, openedAt: now() })
    setDialog({ open: true, mode: 'create' })
  }

  function openEdit(o: ServiceOrderResponse) {
    setForm({
      orderNumber: o.orderNumber,
      type: o.type,
      openedAt: o.openedAt.slice(0, 16),
      closedAt: o.closedAt?.slice(0, 16),
      notes: o.notes ?? '',
    })
    setDialog({ open: true, mode: 'edit', id: o.id })
  }

  function closeDialog() {
    if (saving) return
    setDialog({ open: false, mode: 'create' })
  }

  async function handleSubmit() {
    if (!form.orderNumber.trim()) return
    setSaving(true)
    try {
      const payload: ServiceOrderRequest = {
        ...form,
        openedAt: fromInput(form.openedAt),
        closedAt: form.closedAt ? fromInput(form.closedAt) : undefined,
        notes: form.notes || undefined,
      }
      if (dialog.mode === 'create') {
        await ordersApi.create(payload)
      } else {
        await ordersApi.update(dialog.id!, payload)
      }
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
      await ordersApi.close(closeId)
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
      await ordersApi.remove(deleteId)
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
      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por número da ordem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={typeFilter}
            label="Tipo"
            onChange={(e) => handleFilterChange<OrderType | ''>((v) => setTypeFilter(v))(e.target.value as OrderType | '')}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="delivery">Entrega</MenuItem>
            <MenuItem value="return">Devolução</MenuItem>
            <MenuItem value="maintenance">Manutenção</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Situação</InputLabel>
          <Select
            value={showOpen}
            label="Situação"
            onChange={(e) => handleFilterChange<'all' | 'open' | 'closed'>((v) => setShowOpen(v))(e.target.value as 'all' | 'open' | 'closed')}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="open">Abertas</MenuItem>
            <MenuItem value="closed">Fechadas</MenuItem>
          </Select>
        </FormControl>
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
          Nova Ordem
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                {['Nº da Ordem', 'Tipo', 'Situação', 'Abertura', 'Encerramento', 'Observações', ''].map((h) => (
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
                    Nenhuma ordem encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((o) => {
                  const tc = TYPE_COLORS[o.type as OrderType] ?? { bg: '#f3f4f6', color: '#6b7280' }
                  const isOpen = !o.closedAt
                  return (
                    <TableRow key={o.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>
                        <Chip label={TYPE_LABELS[o.type as OrderType] ?? o.type} size="small" sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 600, fontSize: '0.72rem', height: 22 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isOpen ? 'Aberta' : 'Fechada'}
                          size="small"
                          sx={{ bgcolor: isOpen ? '#fef3c7' : '#f3f4f6', color: isOpen ? '#d97706' : '#6b7280', fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{fmtDate(o.openedAt)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{fmtDate(o.closedAt)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.notes ?? '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {isOpen && (
                          <Tooltip title="Encerrar ordem">
                            <IconButton size="small" onClick={() => setCloseId(o.id)} sx={{ mr: 0.5, color: '#22c55e' }} disabled={closing === o.id}>
                              <CloseOrderIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEdit(o)} sx={{ mr: 0.5 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteId(o.id)} sx={{ color: '#ef4444' }}>
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

      {/* Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {dialog.mode === 'create' ? 'Nova Ordem de Serviço' : 'Editar Ordem de Serviço'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Número da Ordem *" value={form.orderNumber} onChange={(e) => setField('orderNumber', e.target.value)} size="small" />
              <FormControl size="small">
                <InputLabel>Tipo *</InputLabel>
                <Select value={form.type} label="Tipo *" onChange={(e) => setField('type', e.target.value)}>
                  <MenuItem value="delivery">Entrega</MenuItem>
                  <MenuItem value="return">Devolução</MenuItem>
                  <MenuItem value="maintenance">Manutenção</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Abertura *" type="datetime-local" value={form.openedAt} onChange={(e) => setField('openedAt', e.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Encerramento" type="datetime-local" value={form.closedAt ?? ''} onChange={(e) => setField('closedAt', e.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField label="Observações" value={form.notes ?? ''} onChange={(e) => setField('notes', e.target.value)} size="small" multiline rows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button variant="contained" disableElevation onClick={handleSubmit} disabled={saving || !form.orderNumber.trim()} sx={{ background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)' }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!closeId} title="Encerrar ordem" description="Deseja encerrar esta ordem? A data/hora atual será registrada automaticamente." onConfirm={handleClose} onClose={() => setCloseId(null)} loading={!!closing} />
      <ConfirmDialog open={!!deleteId} title="Excluir ordem" description="Tem certeza que deseja excluir esta ordem? Esta ação não pode ser desfeita." onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting} />
    </Box>
  )
}
