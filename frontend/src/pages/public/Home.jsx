import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Grid, Typography } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ScienceIcon from '@mui/icons-material/Science';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const OPCOES = [
  {
    to: '/consulta/salas',
    titulo: 'Salas',
    descricao: 'Consulte as salas de aula disponíveis, capacidade e localização.',
    icone: MeetingRoomIcon,
  },
  {
    to: '/consulta/laboratorios',
    titulo: 'Laboratórios',
    descricao: 'Consulte os laboratórios disponíveis, capacidade e localização.',
    icone: ScienceIcon,
  },
  {
    to: '/consulta/professores',
    titulo: 'Professores',
    descricao: 'Consulte o corpo docente e seus departamentos.',
    icone: PeopleIcon,
  },
  {
    to: '/consulta/grade',
    titulo: 'Grade de horários',
    descricao: 'Consulte os horários de aula por data, sala ou professor.',
    icone: CalendarMonthIcon,
  },
];

export default function Home() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        SARC 2
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Sistema de Alocação de Recursos e Consultas. Consulte gratuitamente salas, laboratórios,
        professores e horários de aula da universidade.
      </Typography>

      <Grid container spacing={3}>
        {OPCOES.map((opcao) => {
          const Icone = opcao.icone;
          return (
            <Grid item xs={12} sm={6} md={3} key={opcao.to}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Icone color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" component="h2" gutterBottom>
                    {opcao.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {opcao.descricao}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={RouterLink} to={opcao.to} size="small" color="primary">
                    Consultar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
