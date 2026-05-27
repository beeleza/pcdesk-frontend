import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
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
  Typography,
} from '@mui/material'
import type { CustomerResponse } from '../types'
import * as customersApi from '../api/customers'
import type { CustomerRequest } from '../api/customers'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY_FORM: CustomerRequest = { name: '', city: '', address: '', contact: '' }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
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

export default function Customers() {
  const [items, setItems] = useState<CustomerResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [version, setVersion] = useState(0)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; id?: number }>({
    open: false,
    mode: 'create',
  })
  const [form, setForm] = useState<CustomerRequest>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    customersApi
      .getAll({ page, size: rowsPerPage, name: debouncedSearch || undefined })
      .then((data) => {
        setItems(data.content)
        setTotal(data.totalElements)
      })
      .finally(() => setLoading(false))
  }, [page, rowsPerPage, debouncedSearch, version])

  const refresh = () => setVersion((v) => v + 1)

  function setField<K extends keyof CustomerRequest>(key: K, value: CustomerRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setDialog({ open: true, mode: 'create' })
  }

  function openEdit(c: CustomerResponse) {
    setForm({ name: c.name, city: c.city, address: c.address ?? '', contact: c.contact ?? '' })
    setDialog({ open: true, mode: 'edit', id: c.id })
  }

  function closeDialog() {
    if (saving) return
    setDialog({ open: false, mode: 'create' })
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.city.trim()) return
    setSaving(true)
    try {
      const payload: CustomerRequest = {
        ...form,
        address: form.address || undefined,
        contact: form.contact || undefined,
      }
      if (dialog.mode === 'create') {
        await customersApi.create(payload)
      } else {
        await customersApi.update(dialog.id!, payload)
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
      await customersApi.remove(deleteId)
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
        <TextField
          size="small"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 360 }}
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
          Novo Cliente
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                {['Nome', 'Cidade', 'Endereço', 'Contato', 'Cadastrado Em', ''].map((h) => (
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
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton height={24} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{c.city}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.address ?? '—'}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{c.contact ?? '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{fmtDate(c.createdAt)}</TableCell>
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
                ))
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

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {dialog.mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome *"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              size="small"
              fullWidth
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Cidade *"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                size="small"
              />
              <TextField
                label="Contato"
                value={form.contact ?? ''}
                onChange={(e) => setField('contact', e.target.value)}
                size="small"
              />
            </Box>
            <TextField
              label="Endereço"
              value={form.address ?? ''}
              onChange={(e) => setField('address', e.target.value)}
              size="small"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={saving || !form.name.trim() || !form.city.trim()}
            sx={{ background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        loading={deleting}
      />
    </Box>
  )
}
