import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { criarReserva } from '../../api/reservas';
import ReservaForm from './ReservaForm';

export default function NovaReserva() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(payload) {
    setEnviando(true);
    try {
      await criarReserva(payload);
      navigate('/professor/reservas');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nova reserva
      </Typography>
      <ReservaForm onSubmit={handleSubmit} enviando={enviando} tituloBotao="Criar reserva" />
    </Box>
  );
}
