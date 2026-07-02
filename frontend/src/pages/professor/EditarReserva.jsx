import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { atualizarReserva, buscarReserva } from '../../api/reservas';
import ReservaForm from './ReservaForm';

export default function EditarReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    buscarReserva(id)
      .then((dados) => setReserva(dados))
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar a reserva'))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleSubmit(payload) {
    setEnviando(true);
    try {
      await atualizarReserva(id, payload);
      navigate('/professor/reservas');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (erro && !reserva) {
    return <Alert severity="error">{erro}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Editar reserva
      </Typography>
      <ReservaForm
        valoresIniciais={{
          turma: reserva.turma || '',
          espacoId: reserva.espacoId || '',
          data: (reserva.data || '').slice(0, 10),
          horaInicio: reserva.horaInicio || '',
          horaFim: reserva.horaFim || '',
          observacoes: reserva.observacoes || '',
          disciplinaId: reserva.disciplinaId || '',
          cursoId: reserva.cursoId || '',
        }}
        equipamentosIniciais={(reserva.equipamentos || []).map((eq) => ({
          equipamentoId: eq.equipamentoId,
          quantidade: eq.quantidade,
        }))}
        onSubmit={handleSubmit}
        enviando={enviando}
        tituloBotao="Salvar alterações"
      />
    </Box>
  );
}
