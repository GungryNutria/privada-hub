import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../App';
import { reservationsApi, Reservation } from '../api/reservations';
import dayjs from 'dayjs';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para nueva reservación
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  // Mes actual
  const currentMonth = dayjs();
  const year = currentMonth.year();
  const month = currentMonth.month() + 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [monthReservations, available] = await Promise.all([
        reservationsApi.getByMonth(year, month),
        reservationsApi.getAvailableDates(year, month),
      ]);
      setReservations(monthReservations.filter(r => r.status === 'active'));
      setAvailableDates(available.map((d: Date | string) => 
        typeof d === 'string' ? d : dayjs(d).format('YYYY-MM-DD')
      ));
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedDate) return;
    
    try {
      await reservationsApi.create({
        houseId: user.id,
        date: selectedDate,
        notes: notes || undefined,
      });
      setSuccess('Reservación creada exitosamente');
      setOpenDialog(false);
      setSelectedDate('');
      setNotes('');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Error al crear reservación');
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await reservationsApi.cancel(reservationId, user.id);
      setSuccess('Reservación cancelada');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Error al cancelar reservación');
    }
  };

  // Reservaciones del usuario actual
  const myReservations = reservations.filter(r => r.houseId === user.id);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Bienvenido, {user.ownerName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Casa {user.lotNumber}
          </Typography>
        </Box>
        <Button startIcon={<LogoutIcon />} onClick={onLogout} color="inherit">
          Salir
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Mis reservaciones */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mis Reservaciones
        </Typography>
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : myReservations.length === 0 ? (
          <Typography color="text.secondary">
            No tienes reservaciones este mes
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {myReservations.map((r) => (
              <Paper
                key={r.id}
                variant="outlined"
                sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {dayjs(r.date).format('dddd, D MMMM YYYY')}
                  </Typography>
                  {r.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {r.notes}
                    </Typography>
                  )}
                </Box>
                <Button
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => handleCancelReservation(r.id)}
                >
                  Cancelar
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Calendario de disponibilidad */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Disponibilidad - {currentMonth.format('MMMM YYYY')}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<CalendarMonthIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mt: 2 }}
          disabled={availableDates.length === 0}
        >
          Nueva Reservación
        </Button>

        {availableDates.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No hay fechas disponibles este mes
          </Typography>
        )}
      </Paper>

      {/* Todas las reservaciones del mes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reservaciones del Mes
        </Typography>
        {reservations.length === 0 ? (
          <Typography color="text.secondary">
            No hay reservaciones este mes
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {reservations.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  px: 2,
                  bgcolor: r.houseId === user.id ? 'action.selected' : 'background.default',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography>
                    {dayjs(r.date).format('D MMM')} - Casa {r.house.lotNumber}
                  </Typography>
                </Box>
                {r.houseId === user.id && (
                  <Chip label="Tu reservación" size="small" color="primary" />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Dialog para nueva reservación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nueva Reservación</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            type="date"
            fullWidth
            sx={{ mt: 2 }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: dayjs().format('YYYY-MM-DD'),
            }}
          />
          <TextField
            label="Notas (opcional)"
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Cumpleaños, reunión familiar..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateReservation}
            disabled={!selectedDate}
          >
            Reservar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;