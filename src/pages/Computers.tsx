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
import type { ComputerResponse, ComputerStatus } from '../types'
import * as computersApi from '../api/computers'
import type { ComputerRequest } from '../api/computers'
import ConfirmDialog from '../components/ConfirmDialog'

// ── constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<{ value: ComputerStatus | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'available', label: 'Disponível' },
  { value: 'allocated', label: 'Alocado' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'retired', label: 'Baixado' },
]

const STATUS_COLORS: Record<ComputerStatus, { bg: string; color: string }> = {
  available: { bg: '#dcfce7', color: '#16a34a' },
  allocated: { bg: '#dbeafe', color: '#1d4ed8' },
  maintenance: { bg: '#fef3c7', color: '#d97706' },
  retired: { bg: '#f3f4f6', color: '#6b7280' },
}

const STATUS_LABELS: Record<ComputerStatus, string> = {
  available: 'Disponível',
  allocated: 'Alocado',
  maintenance: 'Manutenção',
  retired: 'Baixado',
}

const OS_OPTIONS = ['Windows 10', 'Windows 11', 'Windows 7 professional', 'Linux', 'Other']
const STORAGE_TYPES = ['HDD', 'SSD', 'NVMe']

const EMPTY_FORM: ComputerRequest = {
  assetTag: '',
  processor: '',
  motherboard: '',
  ramGb: undefined,
  storageGb: undefined,
  storageType: '',
  gpu: '',
  operatingSystem: '',
  status: 'available',
}

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

// ── component ─────────────────────────────────────────────────────────────────

export default function Computers() {
  const [items, setItems] = useState<ComputerResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [version, setVersion] = useState(0)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComputerStatus | ''>('')

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; id?: number }>({
    open: false,
    mode: 'create',
  })
  const [form, setForm] = useState<ComputerRequest>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Debounce search → reset to page 0 together
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Fetch
  useEffect(() => {
    setLoading(true)
    computersApi
      .getAll({
        page,
        size: rowsPerPage,
        status: statusFilter || undefined,
        assetTag: debouncedSearch || undefined,
      })
      .then((data) => {
        setItems(data.content)
        setTotal(data.totalElements)
      })
      .finally(() => setLoading(false))
  }, [page, rowsPerPage, debouncedSearch, statusFilter, version])

  const refresh = () => setVersion((v) => v + 1)

  function setField<K extends keyof ComputerRequest>(key: K, value: ComputerRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setDialog({ open: true, mode: 'create' })
  }

  function openEdit(c: ComputerResponse) {
    setForm({
      assetTag: c.assetTag,
      processor: c.processor ?? '',
      motherboard: c.motherboard ?? '',
      ramGb: c.ramGb ?? undefined,
      storageGb: c.storageGb ?? undefined,
      storageType: c.storageType ?? '',
      gpu: c.gpu ?? '',
      operatingSystem: c.operatingSystem ?? '',
      status: c.status,
    })
    setDialog({ open: true, mode: 'edit', id: c.id })
  }

  function closeDialog() {
    if (saving) return
    setDialog({ open: false, mode: 'create' })
  }

  async function handleSubmit() {
    if (!form.assetTag.trim()) return
    setSaving(true)
    try {
      const payload: ComputerRequest = {
        ...form,
        processor: form.processor || undefined,
        motherboard: form.motherboard || undefined,
        storageType: form.storageType || undefined,
        gpu: form.gpu || undefined,
        operatingSystem: form.operatingSystem || undefined,
      }
      if (dialog.mode === 'create') {
        await computersApi.create(payload)
      } else {
        await computersApi.update(dialog.id!, payload)
      }
      closeDialog()
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await computersApi.remove(deleteId)
      setDeleteId(null)
      if (items.length === 1 && page > 0) setPage((p) => p - 1)
      else refresh()
    } finally {
      setDeleting(false)
    }
  }

  function handleStatusFilterChange(value: ComputerStatus | '') {
    setStatusFilter(value)
    setPage(0)
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
          placeholder="Buscar por asset tag..."
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => handleStatusFilterChange(e.target.value as ComputerStatus | '')}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
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
          Novo Computador
        </Button>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                {['Asset Tag', 'Processador', 'RAM', 'Armazenamento', 'Sistema Operacional', 'Status', ''].map((h) => (
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
                    Nenhum computador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((c) => {
                  const sc = STATUS_COLORS[c.status]
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {c.assetTag}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {c.processor ?? '—'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {c.ramGb ? `${c.ramGb} GB` : '—'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {c.storageGb ? `${c.storageGb} GB${c.storageType ? ` ${c.storageType}` : ''}` : '—'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {c.operatingSystem ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[c.status]}
                          size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEdit(c)} sx={{ mr: 0.5 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteId(c.id)} sx={{ color: '#ef4444' }}>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {dialog.mode === 'create' ? 'Novo Computador' : 'Editar Computador'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
            <TextField
              label="Asset Tag *"
              value={form.assetTag}
              onChange={(e) => setField('assetTag', e.target.value)}
              size="small"
            />
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status ?? 'available'}
                label="Status"
                onChange={(e) => setField('status', e.target.value)}
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Processador"
              value={form.processor ?? ''}
              onChange={(e) => setField('processor', e.target.value)}
              size="small"
            />
            <TextField
              label="Motherboard"
              value={form.motherboard ?? ''}
              onChange={(e) => setField('motherboard', e.target.value)}
              size="small"
            />
            <TextField
              label="RAM (GB)"
              type="number"
              value={form.ramGb ?? ''}
              onChange={(e) => setField('ramGb', e.target.value ? Number(e.target.value) : undefined)}
              size="small"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              label="Armazenamento (GB)"
              type="number"
              value={form.storageGb ?? ''}
              onChange={(e) => setField('storageGb', e.target.value ? Number(e.target.value) : undefined)}
              size="small"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <FormControl size="small">
              <InputLabel>Tipo de Armazenamento</InputLabel>
              <Select
                value={form.storageType ?? ''}
                label="Tipo de Armazenamento"
                onChange={(e) => setField('storageType', e.target.value)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {STORAGE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="GPU"
              value={form.gpu ?? ''}
              onChange={(e) => setField('gpu', e.target.value)}
              size="small"
            />
            <FormControl size="small" sx={{ gridColumn: 'span 2' }}>
              <InputLabel>Sistema Operacional</InputLabel>
              <Select
                value={form.operatingSystem ?? ''}
                label="Sistema Operacional"
                onChange={(e) => setField('operatingSystem', e.target.value)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {OS_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={saving || !form.assetTag.trim()}
            sx={{ background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir computador"
        description="Tem certeza que deseja excluir este computador? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        loading={deleting}
      />
    </Box>
  )
}
