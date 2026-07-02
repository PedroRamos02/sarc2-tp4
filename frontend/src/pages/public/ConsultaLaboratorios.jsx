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
import { consultarLaboratorios } from '../../api/consulta';

export default function ConsultaLaboratorios() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    consultarLaboratorios()
      .then((dados) => setLaboratorios(dados))
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao consultar laboratórios'))
      .finally(() => setCarregando(false));
  }, []);

  const laboratoriosFiltrados = useMemo(
    () => laboratorios.filter((lab) => lab.nome.toLowerCase().includes(busca.toLowerCase())),
    [laboratorios, busca],
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Consulta de Laboratórios
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

      {!carregando && !erro && laboratoriosFiltrados.length === 0 && (
        <Alert severity="info">Nenhum laboratório encontrado.</Alert>
      )}

      {!carregando && !erro && laboratoriosFiltrados.length > 0 && (
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
              {laboratoriosFiltrados.map((lab) => (
                <TableRow key={lab.id}>
                  <TableCell>{lab.nome}</TableCell>
                  <TableCell>{lab.capacidade}</TableCell>
                  <TableCell>{lab.bloco || '—'}</TableCell>
                  <TableCell>{lab.descricao || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
