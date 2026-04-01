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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

function Register() {
  const navigate = useNavigate();
  const [lotNumber, setLotNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!lotNumber || !ownerName || !pin || !confirmPin) {
      setError('Todos los campos marcados con * son obligatorios');
      return;
    }

    if (pin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('El PIN debe ser de 4 dígitos');
      return;
    }

    setLoading(true);

    try {
      await api.post('/houses', {
        lotNumber: parseInt(lotNumber),
        ownerName,
        phone: phone || undefined,
        pin,
      });

      setSuccess('¡Casa registrada exitosamente! Ahora puedes iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Error al registrar la casa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/login')}
          sx={{ mb: 2 }}
        >
          Volver al login
        </Button>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          Registrar Casa
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom align="center">
          Crea tu cuenta para reservar la palapa
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Número de Casa / Lote *"
            type="number"
            fullWidth
            margin="normal"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Nombre del Propietario *"
            fullWidth
            margin="normal"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
          <TextField
            label="Teléfono (opcional)"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="PIN de 4 dígitos *"
            type="password"
            fullWidth
            margin="normal"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
            inputProps={{ maxLength: 4 }}
            helperText="Este PIN servirá para acceder a tu cuenta"
          />
          <TextField
            label="Confirmar PIN *"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
            inputProps={{ maxLength: 4 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Casa'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;