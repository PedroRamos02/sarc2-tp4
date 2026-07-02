import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { cancelarReserva, listarReservas } from '../../api/reservas';
import { listarEspacos } from '../../api/espacos';
import { listarDisciplinas } from '../../api/disciplinas';

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([]);
  const [espacosMapa, setEspacosMapa] = useState({});
  const [disciplinasMapa, setDisciplinasMapa] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState('');

  function carregar() {
    setCarregando(true);
    setErro('');
    Promise.all([listarReservas(), listarEspacos(), listarDisciplinas()])
      .then(([reservasDados, espacosDados, disciplinasDados]) => {
        setReservas(reservasDados);
        setEspacosMapa(Object.fromEntries(espacosDados.map((e) => [e.id, e.nome])));
        setDisciplinasMapa(Object.fromEntries(disciplinasDados.map((d) => [d.id, d.nome])));
      })
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar reservas'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleConfirmarCancelamento() {
    if (!reservaParaCancelar) return;
    setCancelando(true);
    setErroCancelamento('');
    try {
      await cancelarReserva(reservaParaCancelar.id);
      setReservaParaCancelar(null);
      carregar();
    } catch (err) {
      setErroCancelamento(err.response?.data?.error || 'Erro ao cancelar reserva');
    } finally {
      setCancelando(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Minhas reservas
        </Typography>
        <Button variant="contained" component={RouterLink} to="/professor/reservas/nova">
          Nova reserva
        </Button>
      </Stack>

      {carregando && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!carregando && erro && <Alert severity="error">{erro}</Alert>}

      {!carregando && !erro && reservas.length === 0 && (
        <Alert severity="info">Você ainda não possui reservas.</Alert>
      )}

      {!carregando && !erro && reservas.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Turma</TableCell>
                <TableCell>Disciplina</TableCell>
                <TableCell>Sala/Laboratório</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>{(reserva.data || '').slice(0, 10)}</TableCell>
                  <TableCell>
                    {reserva.horaInicio} – {reserva.horaFim}
                  </TableCell>
                  <TableCell>{reserva.turma}</TableCell>
                  <TableCell>{disciplinasMapa[reserva.disciplinaId] || reserva.disciplinaId || '—'}</TableCell>
                  <TableCell>{espacosMapa[reserva.espacoId] || reserva.espacoId}</TableCell>
                  <TableCell>
                    <Chip
                      label={reserva.status === 'ATIVA' ? 'Ativa' : 'Cancelada'}
                      color={reserva.status === 'ATIVA' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {reserva.status === 'ATIVA' && (
                        <>
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/professor/reservas/${reserva.id}/editar`}
                          >
                            Editar
                          </Button>
                          <Button size="small" color="error" onClick={() => setReservaParaCancelar(reserva)}>
                            Cancelar
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(reservaParaCancelar)} onClose={() => setReservaParaCancelar(null)}>
        <DialogTitle>Cancelar reserva</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar a reserva da turma "{reservaParaCancelar?.turma}" em{' '}
            {(reservaParaCancelar?.data || '').slice(0, 10)}?
          </DialogContentText>
          {erroCancelamento && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {erroCancelamento}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReservaParaCancelar(null)} disabled={cancelando}>
            Voltar
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmarCancelamento} disabled={cancelando}>
            {cancelando ? 'Cancelando…' : 'Confirmar cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
