import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ptBR } from 'date-fns/locale';

import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import ConsultaSalas from './pages/public/ConsultaSalas';
import ConsultaLaboratorios from './pages/public/ConsultaLaboratorios';
import ConsultaProfessores from './pages/public/ConsultaProfessores';
import ConsultaGrade from './pages/public/ConsultaGrade';
import Login from './pages/public/Login';
import NotFound from './pages/public/NotFound';

import ProfessorDashboard from './pages/professor/Dashboard';
import MinhasReservas from './pages/professor/MinhasReservas';
import NovaReserva from './pages/professor/NovaReserva';
import EditarReserva from './pages/professor/EditarReserva';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProfessores from './pages/admin/Professores';
import AdminCursos from './pages/admin/Cursos';
import AdminDisciplinas from './pages/admin/Disciplinas';
import AdminSalas from './pages/admin/Salas';
import AdminLaboratorios from './pages/admin/Laboratorios';
import AdminEquipamentos from './pages/admin/Equipamentos';
import AdminRelatorios from './pages/admin/Relatorios';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/consulta/salas" element={<ConsultaSalas />} />
                <Route path="/consulta/laboratorios" element={<ConsultaLaboratorios />} />
                <Route path="/consulta/professores" element={<ConsultaProfessores />} />
                <Route path="/consulta/grade" element={<ConsultaGrade />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute roles={['PROFESSOR', 'ADMIN']} />}>
                  <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
                  <Route path="/professor/reservas" element={<MinhasReservas />} />
                  <Route path="/professor/reservas/nova" element={<NovaReserva />} />
                  <Route path="/professor/reservas/:id/editar" element={<EditarReserva />} />
                </Route>

                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/professores" element={<AdminProfessores />} />
                  <Route path="/admin/cursos" element={<AdminCursos />} />
                  <Route path="/admin/disciplinas" element={<AdminDisciplinas />} />
                  <Route path="/admin/salas" element={<AdminSalas />} />
                  <Route path="/admin/laboratorios" element={<AdminLaboratorios />} />
                  <Route path="/admin/equipamentos" element={<AdminEquipamentos />} />
                  <Route path="/admin/relatorios" element={<AdminRelatorios />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
