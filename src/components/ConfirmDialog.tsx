import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

interface Props {
  open: boolean
  title?: string
  description?: string
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export default function ConfirmDialog({
  open,
  title = 'Confirmar exclusão',
  description = 'Esta ação não pode ser desfeita.',
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          disableElevation
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
