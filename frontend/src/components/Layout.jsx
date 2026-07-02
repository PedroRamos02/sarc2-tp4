import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../contexts/AuthContext';

const LINKS_PUBLICO = [
  { to: '/', label: 'Início' },
  { to: '/consulta/salas', label: 'Salas' },
  { to: '/consulta/laboratorios', label: 'Laboratórios' },
  { to: '/consulta/professores', label: 'Professores' },
  { to: '/consulta/grade', label: 'Grade de horários' },
];

const LINKS_PROFESSOR = [
  { to: '/professor/dashboard', label: 'Dashboard' },
  { to: '/professor/reservas', label: 'Minhas reservas' },
  { to: '/professor/reservas/nova', label: 'Nova reserva' },
];

const LINKS_ADMIN = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/professores', label: 'Professores' },
  { to: '/admin/cursos', label: 'Cursos' },
  { to: '/admin/disciplinas', label: 'Disciplinas' },
  { to: '/admin/salas', label: 'Salas' },
  { to: '/admin/laboratorios', label: 'Laboratórios' },
  { to: '/admin/equipamentos', label: 'Equipamentos' },
  { to: '/admin/relatorios', label: 'Relatórios' },
];

export default function Layout() {
  const { usuario, autenticado, sair } = useAuth();
  const navigate = useNavigate();

  const links = !autenticado
    ? LINKS_PUBLICO
    : usuario.role === 'ADMIN'
      ? LINKS_ADMIN
      : LINKS_PROFESSOR;

  function handleSair() {
    sair();
    navigate('/login');
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar sx={{ gap: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 0, mr: 2 }}>
            <SchoolIcon />
            <Typography variant="h6" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
              SARC 2
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1, overflowX: 'auto' }}>
            {links.map((link) => (
              <Button key={link.to} component={RouterLink} to={link.to} color="inherit">
                {link.label}
              </Button>
            ))}
          </Stack>

          {autenticado ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={usuario.role === 'ADMIN' ? 'Administrador' : 'Professor'} color="secondary" size="small" />
              <Typography variant="body2">{usuario.nome}</Typography>
              <Button color="inherit" onClick={handleSair}>
                Sair
              </Button>
            </Stack>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Entrar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">SARC 2 — Sistema de Alocação de Recursos e Consultas</Typography>
      </Box>
    </Box>
  );
}
