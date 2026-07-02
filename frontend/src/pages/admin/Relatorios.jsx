import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
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
} from '@mui/material';
import { listarReservas } from '../../api/reservas';
import { listarEspacos } from '../../api/espacos';

export default function Relatorios() {
  const [reservas, setReservas] = useState([]);
  const [espacosMapa, setEspacosMapa] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODAS');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    Promise.all([listarReservas(), listarEspacos()])
      .then(([reservasDados, espacosDados]) => {
        setReservas(reservasDados);
        setEspacosMapa(Object.fromEntries(espacosDados.map((e) => [e.id, e.nome])));
      })
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar relatório'))
      .finally(() => setCarregando(false));
  }, []);

  const resumo = useMemo(() => {
    const ativas = reservas.filter((r) => r.status === 'ATIVA').length;
    const canceladas = reservas.filter((r) => r.status === 'CANCELADA').length;
    const porEspaco = {};
    reservas.forEach((r) => {
      const nome = espacosMapa[r.espacoId] || r.espacoId;
      porEspaco[nome] = (porEspaco[nome] || 0) + 1;
    });
    return { total: reservas.length, ativas, canceladas, porEspaco };
  }, [reservas, espacosMapa]);

  const reservasFiltradas = useMemo(
    () =>
      reservas.filter((r) => {
        const statusOk = filtroStatus === 'TODAS' || r.status === filtroStatus;
        const buscaOk = !busca || (r.turma || '').toLowerCase().includes(busca.toLowerCase());
        return statusOk && buscaOk;
      }),
    [reservas, filtroStatus, busca],
  );

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios de reservas
      </Typography>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Total de reservas
              </Typography>
              <Typography variant="h3">{resumo.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Reservas ativas
              </Typography>
              <Typography variant="h3">{resumo.ativas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Reservas canceladas
              </Typography>
              <Typography variant="h3">{resumo.canceladas}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Reservas por sala/laboratório
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {Object.entries(resumo.porEspaco).length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nenhuma reserva registrada.
          </Typography>
        )}
        {Object.entries(resumo.porEspaco).map(([nome, total]) => (
          <Chip key={nome} label={`${nome}: ${total}`} />
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          label="Status"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
        >
          <MenuItem value="TODAS">Todas</MenuItem>
          <MenuItem value="ATIVA">Ativas</MenuItem>
          <MenuItem value="CANCELADA">Canceladas</MenuItem>
        </TextField>
        <TextField
          label="Buscar por turma"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
      </Stack>

      {reservasFiltradas.length === 0 ? (
        <Alert severity="info">Nenhuma reserva encontrada para os filtros selecionados.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Turma</TableCell>
                <TableCell>Sala/Laboratório</TableCell>
                <TableCell>Professor</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservasFiltradas.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{(r.data || '').slice(0, 10)}</TableCell>
                  <TableCell>
                    {r.horaInicio} – {r.horaFim}
                  </TableCell>
                  <TableCell>{r.turma}</TableCell>
                  <TableCell>{espacosMapa[r.espacoId] || r.espacoId}</TableCell>
                  <TableCell>{r.professorId}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status === 'ATIVA' ? 'Ativa' : 'Cancelada'}
                      color={r.status === 'ATIVA' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
