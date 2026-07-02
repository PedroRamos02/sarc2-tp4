import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { listarReservas } from '../../api/reservas';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [totalAtivas, setTotalAtivas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarReservas({ status: 'ATIVA' })
      .then((dados) => setTotalAtivas(dados.length))
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar resumo'))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Olá, {usuario?.nome}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Bem-vindo ao seu painel de reservas.
      </Typography>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Card sx={{ minWidth: 220 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Reservas ativas
            </Typography>
            {carregando ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h3">{totalAtivas}</Typography>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button variant="contained" component={RouterLink} to="/professor/reservas/nova">
          Nova reserva
        </Button>
        <Button variant="outlined" component={RouterLink} to="/professor/reservas">
          Minhas reservas
        </Button>
      </Stack>
    </Box>
  );
}
