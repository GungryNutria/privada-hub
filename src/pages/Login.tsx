import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { User } from '../App';

interface LoginProps {
  onLogin: (user: User) => void;
}

function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [lotNumber, setLotNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(parseInt(lotNumber), pin);
      if (result.success) {
        onLogin(result.house);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Privada Hub
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom align="center">
          Reservación de Palapa
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Número de Casa"
            type="number"
            fullWidth
            margin="normal"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            required
            inputProps={{ min: 1, max: 300 }}
          />
          <TextField
            label="PIN"
            type="password"
            fullWidth
            margin="normal"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            inputProps={{ maxLength: 4 }}
            helperText="PIN de 4 dígitos"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate('/register')}
          >
            ¿No tienes cuenta? Registra tu casa
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;