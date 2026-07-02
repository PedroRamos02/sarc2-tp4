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
import { consultarProfessores } from '../../api/consulta';

export default function ConsultaProfessores() {
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    consultarProfessores()
      .then((dados) => setProfessores(dados))
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao consultar professores'))
      .finally(() => setCarregando(false));
  }, []);

  const professoresFiltrados = useMemo(
    () =>
      professores.filter((professor) => professor.nome.toLowerCase().includes(busca.toLowerCase())),
    [professores, busca],
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Consulta de Professores
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

      {!carregando && !erro && professoresFiltrados.length === 0 && (
        <Alert severity="info">Nenhum professor encontrado.</Alert>
      )}

      {!carregando && !erro && professoresFiltrados.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Telefone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {professoresFiltrados.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell>{professor.nome}</TableCell>
                  <TableCell>{professor.email}</TableCell>
                  <TableCell>{professor.departamento || '—'}</TableCell>
                  <TableCell>{professor.telefone || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
