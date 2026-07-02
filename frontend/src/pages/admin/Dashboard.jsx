import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { listarProfessores } from '../../api/professores';
import { listarCursos } from '../../api/cursos';
import { listarDisciplinas } from '../../api/disciplinas';
import { listarEspacos } from '../../api/espacos';
import { listarEquipamentos } from '../../api/equipamentos';
import { listarReservas } from '../../api/reservas';

const ATALHOS = [
  { to: '/admin/professores', label: 'Professores' },
  { to: '/admin/cursos', label: 'Cursos' },
  { to: '/admin/disciplinas', label: 'Disciplinas' },
  { to: '/admin/salas', label: 'Salas' },
  { to: '/admin/laboratorios', label: 'Laboratórios' },
  { to: '/admin/equipamentos', label: 'Equipamentos' },
];

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([
      listarProfessores({ ativo: true }),
      listarCursos({ ativo: true }),
      listarDisciplinas({ ativo: true }),
      listarEspacos({ ativo: true }),
      listarEquipamentos({ ativo: true }),
      listarReservas({ status: 'ATIVA' }),
    ])
      .then(([professores, cursos, disciplinas, espacos, equipamentos, reservas]) => {
        setResumo({
          professores: professores.length,
          cursos: cursos.length,
          disciplinas: disciplinas.length,
          espacos: espacos.length,
          equipamentos: equipamentos.length,
          reservas: reservas.length,
        });
      })
      .catch((err) => setErro(err.response?.data?.error || 'Erro ao carregar resumo'))
      .finally(() => setCarregando(false));
  }, []);

  const cartoes = resumo
    ? [
        { label: 'Professores ativos', valor: resumo.professores },
        { label: 'Cursos ativos', valor: resumo.cursos },
        { label: 'Disciplinas ativas', valor: resumo.disciplinas },
        { label: 'Salas e laboratórios ativos', valor: resumo.espacos },
        { label: 'Equipamentos ativos', valor: resumo.equipamentos },
        { label: 'Reservas ativas', valor: resumo.reservas },
      ]
    : [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel administrativo
      </Typography>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      {carregando ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cartoes.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.label}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    {c.label}
                  </Typography>
                  <Typography variant="h3">{c.valor}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h6" gutterBottom>
        Atalhos
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {ATALHOS.map((a) => (
          <Button key={a.to} variant="outlined" component={RouterLink} to={a.to}>
            {a.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
