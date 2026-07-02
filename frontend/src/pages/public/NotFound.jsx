import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
      <Typography variant="h1" component="h1" color="primary" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Página não encontrada
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
        Voltar para o início
      </Button>
    </Box>
  );
}
