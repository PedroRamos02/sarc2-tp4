import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

export default function CrudPage({
  title,
  newLabel = 'Novo',
  emptyMessage = 'Nenhum registro encontrado.',
  columns,
  fields,
  fetchList,
  initialValues,
  getFormValues,
  onCreate,
  onUpdate,
  onToggleStatus,
  onRemove,
  getItemLabel,
  renderExtraActions,
  transformPayload,
  afterCreateMessage,
}) {
  const [items, setItems] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [valores, setValores] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const [removendo, setRemovendo] = useState(null);
  const [removendoAtivo, setRemovendoAtivo] = useState(false);
  const [erroRemocao, setErroRemocao] = useState('');

  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  function reload() {
    setCarregando(true);
    setErro('');
    fetchList()
      .then(setItems)
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar dados'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCriacao() {
    setEditando(null);
    setValores(initialValues || {});
    setErroForm('');
    setDialogAberto(true);
  }

  function abrirEdicao(row) {
    setEditando(row);
    setValores(getFormValues ? getFormValues(row) : row);
    setErroForm('');
    setDialogAberto(true);
  }

  function handleChangeCampo(nome) {
    return (e) => setValores((v) => ({ ...v, [nome]: e.target.value }));
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErroForm('');
    const payload = transformPayload ? transformPayload(valores) : valores;
    try {
      if (editando) {
        await onUpdate(editando.id, payload);
        setDialogAberto(false);
        reload();
      } else {
        const criado = await onCreate(payload);
        setDialogAberto(false);
        reload();
        if (afterCreateMessage) {
          const mensagem = afterCreateMessage(criado);
          if (mensagem) setMensagemSucesso(mensagem);
        }
      }
    } catch (err) {
      setErroForm(err.response?.data?.error || 'Erro ao salvar registro');
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggleStatus(row) {
    setErro('');
    try {
      await onToggleStatus(row);
      reload();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao alterar status');
    }
  }

  async function handleConfirmarRemocao() {
    setRemovendoAtivo(true);
    setErroRemocao('');
    try {
      await onRemove(removendo.id);
      setRemovendo(null);
      reload();
    } catch (err) {
      setErroRemocao(err.response?.data?.error || 'Erro ao remover registro');
    } finally {
      setRemovendoAtivo(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        <Button variant="contained" onClick={abrirCriacao}>
          {newLabel}
        </Button>
      </Stack>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>
          {erro}
        </Alert>
      )}

      {carregando && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!carregando && items.length === 0 && !erro && <Alert severity="info">{emptyMessage}</Alert>}

      {!carregando && items.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                  ))}
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                      <Button size="small" onClick={() => abrirEdicao(row)}>
                        Editar
                      </Button>
                      {onToggleStatus && (
                        <Button size="small" onClick={() => handleToggleStatus(row)}>
                          {row.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      )}
                      {renderExtraActions && renderExtraActions(row, { reload, setErro })}
                      <Button size="small" color="error" onClick={() => setRemovendo(row)}>
                        Remover
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editando ? 'Editar registro' : newLabel}</DialogTitle>
        <Box component="form" onSubmit={handleSalvar}>
          <DialogContent>
            {erroForm && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {erroForm}
              </Alert>
            )}
            <Stack spacing={2}>
              {fields.map((field) => (
                <TextField
                  key={field.name}
                  select={field.type === 'select'}
                  multiline={field.type === 'textarea'}
                  minRows={field.type === 'textarea' ? 2 : undefined}
                  type={field.type === 'number' ? 'number' : field.type === 'select' || field.type === 'textarea' ? 'text' : field.type || 'text'}
                  label={field.label}
                  value={valores[field.name] ?? ''}
                  onChange={handleChangeCampo(field.name)}
                  required={field.required}
                  fullWidth
                  inputProps={field.inputProps}
                  helperText={field.helperText}
                >
                  {field.type === 'select' &&
                    (field.options || []).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                </TextField>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(removendo)} onClose={() => setRemovendo(null)}>
        <DialogTitle>Remover registro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover{' '}
            {removendo ? (getItemLabel ? getItemLabel(removendo) : removendo.nome) : ''}? Esta ação não pode ser
            desfeita.
          </DialogContentText>
          {erroRemocao && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {erroRemocao}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovendo(null)} disabled={removendoAtivo}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmarRemocao} disabled={removendoAtivo}>
            {removendoAtivo ? 'Removendo…' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(mensagemSucesso)} onClose={() => setMensagemSucesso(null)}>
        <DialogTitle>Sucesso</DialogTitle>
        <DialogContent>{mensagemSucesso}</DialogContent>
        <DialogActions>
          <Button onClick={() => setMensagemSucesso(null)} variant="contained">
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
