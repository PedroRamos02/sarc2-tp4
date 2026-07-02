import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { listarEspacos } from '../../api/espacos';
import { listarDisciplinas } from '../../api/disciplinas';
import { listarCursos } from '../../api/cursos';
import { listarEquipamentos } from '../../api/equipamentos';
import { verificarDisponibilidade } from '../../api/reservas';

const VALORES_INICIAIS = {
  turma: '',
  espacoId: '',
  data: '',
  horaInicio: '',
  horaFim: '',
  observacoes: '',
  disciplinaId: '',
  cursoId: '',
};

export default function ReservaForm({ valoresIniciais, equipamentosIniciais, onSubmit, enviando, tituloBotao }) {
  const [valores, setValores] = useState({ ...VALORES_INICIAIS, ...valoresIniciais });
  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState(equipamentosIniciais || []);
  const [espacos, setEspacos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState([]);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [erro, setErro] = useState('');
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    Promise.all([
      listarEspacos({ ativo: true }),
      listarDisciplinas({ ativo: true }),
      listarCursos({ ativo: true }),
      listarEquipamentos({ ativo: true, disponivel: true }),
    ])
      .then(([e, d, c, eq]) => {
        setEspacos(e);
        setDisciplinas(d);
        setCursos(c);
        setEquipamentosDisponiveis(eq);
      })
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar opções do formulário'))
      .finally(() => setCarregandoOpcoes(false));
  }, []);

  useEffect(() => {
    if (valoresIniciais) {
      setValores((v) => ({ ...v, ...valoresIniciais }));
    }
    if (equipamentosIniciais) {
      setEquipamentosSelecionados(equipamentosIniciais);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valoresIniciais, equipamentosIniciais]);

  function handleChange(campo) {
    return (e) => {
      setValores((v) => ({ ...v, [campo]: e.target.value }));
      setDisponibilidade(null);
    };
  }

  function adicionarEquipamento() {
    setEquipamentosSelecionados((lista) => [...lista, { equipamentoId: '', quantidade: 1 }]);
  }

  function removerEquipamento(index) {
    setEquipamentosSelecionados((lista) => lista.filter((_, i) => i !== index));
  }

  function atualizarEquipamento(index, campo, valor) {
    setEquipamentosSelecionados((lista) =>
      lista.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    );
  }

  async function handleVerificarDisponibilidade() {
    if (!valores.espacoId || !valores.data || !valores.horaInicio || !valores.horaFim) {
      setErro('Preencha sala/laboratório, data e horários antes de verificar a disponibilidade.');
      return;
    }
    setErro('');
    setVerificando(true);
    try {
      const resultado = await verificarDisponibilidade({
        espacoId: valores.espacoId,
        data: valores.data,
        horaInicio: valores.horaInicio,
        horaFim: valores.horaFim,
      });
      setDisponibilidade(resultado);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao verificar disponibilidade');
    } finally {
      setVerificando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    const payload = {
      turma: valores.turma,
      espacoId: valores.espacoId,
      data: valores.data,
      horaInicio: valores.horaInicio,
      horaFim: valores.horaFim,
    };
    if (valores.observacoes) payload.observacoes = valores.observacoes;
    if (valores.disciplinaId) payload.disciplinaId = valores.disciplinaId;
    if (valores.cursoId) payload.cursoId = valores.cursoId;

    const equipamentosValidos = equipamentosSelecionados.filter((eq) => eq.equipamentoId);
    if (equipamentosValidos.length > 0) {
      payload.equipamentos = equipamentosValidos.map((eq) => ({
        equipamentoId: eq.equipamentoId,
        quantidade: Number(eq.quantidade) || 1,
      }));
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro inesperado ao salvar a reserva');
    }
  }

  if (carregandoOpcoes) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>
          {erro}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Turma" value={valores.turma} onChange={handleChange('turma')} fullWidth required />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Sala/Laboratório"
            value={valores.espacoId}
            onChange={handleChange('espacoId')}
            fullWidth
            required
          >
            {espacos.map((espaco) => (
              <MenuItem key={espaco.id} value={espaco.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{espaco.nome}</span>
                  <Chip
                    label={espaco.tipo === 'SALA' ? 'Sala' : 'Laboratório'}
                    size="small"
                    color={espaco.tipo === 'SALA' ? 'primary' : 'secondary'}
                  />
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Data"
            type="date"
            value={valores.data}
            onChange={handleChange('data')}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <TextField
            label="Hora início"
            type="time"
            value={valores.horaInicio}
            onChange={handleChange('horaInicio')}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <TextField
            label="Hora fim"
            type="time"
            value={valores.horaFim}
            onChange={handleChange('horaFim')}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Disciplina (opcional)"
            value={valores.disciplinaId}
            onChange={handleChange('disciplinaId')}
            fullWidth
          >
            <MenuItem value="">Nenhuma</MenuItem>
            {disciplinas.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.nome}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Curso (opcional)"
            value={valores.cursoId}
            onChange={handleChange('cursoId')}
            fullWidth
          >
            <MenuItem value="">Nenhum</MenuItem>
            {cursos.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nome}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Observações (opcional)"
            value={valores.observacoes}
            onChange={handleChange('observacoes')}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Equipamentos
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {equipamentosSelecionados.map((item, index) => (
          <Stack key={index} direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Equipamento"
              value={item.equipamentoId}
              onChange={(e) => atualizarEquipamento(index, 'equipamentoId', e.target.value)}
              sx={{ flexGrow: 1 }}
            >
              {equipamentosDisponiveis.map((eq) => (
                <MenuItem key={eq.id} value={eq.id}>
                  {eq.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantidade"
              type="number"
              value={item.quantidade}
              onChange={(e) => atualizarEquipamento(index, 'quantidade', e.target.value)}
              inputProps={{ min: 1 }}
              sx={{ width: 140 }}
            />
            <IconButton color="error" onClick={() => removerEquipamento(index)} aria-label="Remover equipamento">
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Button startIcon={<AddIcon />} onClick={adicionarEquipamento} sx={{ mb: 3 }}>
        Adicionar equipamento
      </Button>

      {disponibilidade && (
        <Alert severity={disponibilidade.disponivel ? 'success' : 'warning'} sx={{ mb: 2 }}>
          {disponibilidade.disponivel
            ? 'Sala/laboratório disponível no horário selecionado.'
            : `Conflito encontrado: turma ${disponibilidade.conflito?.turma} reservada de ${disponibilidade.conflito?.horaInicio} às ${disponibilidade.conflito?.horaFim}.`}
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={handleVerificarDisponibilidade} disabled={verificando}>
          {verificando ? 'Verificando…' : 'Verificar disponibilidade'}
        </Button>
        <Button type="submit" variant="contained" disabled={enviando}>
          {enviando ? 'Salvando…' : tituloBotao}
        </Button>
      </Stack>
    </Paper>
  );
}
