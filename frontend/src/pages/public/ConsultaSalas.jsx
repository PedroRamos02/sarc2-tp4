import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { consultarSalas } from '../../api/consulta';

export default function ConsultaSalas() {
  const [salas, setSalas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    consultarSalas()
      .then((dados) => setSalas(dados))
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao consultar salas'))
      .finally(() => setCarregando(false));
  }, []);

  const salasFiltradas = useMemo(
    () => salas.filter((sala) => sala.nome.toLowerCase().includes(busca.toLowerCase())),
    [salas, busca],
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Consulta de Salas
      </Typography>

      <TextField
        label="Buscar por nome"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 3, width: { xs: '100%', sm: 320 } }}
      />

      {carregando && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!carregando && erro && <Alert severity="error">{erro}</Alert>}

      {!carregando && !erro && salasFiltradas.length === 0 && (
        <Alert severity="info">Nenhuma sala encontrada.</Alert>
      )}

      {!carregando && !erro && salasFiltradas.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Capacidade</TableCell>
                <TableCell>Bloco</TableCell>
                <TableCell>Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salasFiltradas.map((sala) => (
                <TableRow key={sala.id}>
                  <TableCell>{sala.nome}</TableCell>
                  <TableCell>{sala.capacidade}</TableCell>
                  <TableCell>{sala.bloco || '—'}</TableCell>
                  <TableCell>{sala.descricao || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
