import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
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
import { consultarGrade } from '../../api/consulta';

export default function ConsultaGrade() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    consultarGrade(data ? { data } : undefined)
      .then((dados) => setItens(dados))
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao consultar a grade de horários'))
      .finally(() => setCarregando(false));
  }, [data]);

  const itensOrdenados = [...itens].sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    return a.horaInicio.localeCompare(b.horaInicio);
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Grade de Horários
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
      </Grid>

      {carregando && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!carregando && erro && <Alert severity="error">{erro}</Alert>}

      {!carregando && !erro && itensOrdenados.length === 0 && (
        <Alert severity="info">Nenhuma reserva encontrada para os filtros selecionados.</Alert>
      )}

      {!carregando && !erro && itensOrdenados.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Disciplina</TableCell>
                <TableCell>Turma</TableCell>
                <TableCell>Professor</TableCell>
                <TableCell>Sala/Laboratório</TableCell>
                <TableCell>Equipamentos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itensOrdenados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {item.horaInicio}–{item.horaFim}
                  </TableCell>
                  <TableCell>{item.disciplina?.nome || '—'}</TableCell>
                  <TableCell>{item.turma || '—'}</TableCell>
                  <TableCell>{item.professor?.nome || '—'}</TableCell>
                  <TableCell>
                    {item.espaco ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{item.espaco.nome}</span>
                        <Chip
                          label={item.espaco.tipo === 'LABORATORIO' ? 'Laboratório' : 'Sala'}
                          size="small"
                          color={item.espaco.tipo === 'LABORATORIO' ? 'secondary' : 'primary'}
                        />
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.equipamentos && item.equipamentos.length > 0
                      ? item.equipamentos.map((equip) => equip.nome).join(', ')
                      : '—'}
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
