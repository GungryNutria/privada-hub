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
  IconButton,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../App';
import { reservationsApi, Reservation } from '../api/reservations';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const theme = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Mes actual visualizado
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  
  // Dialog para nueva reservación
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');

  const year = currentMonth.year();
  const month = currentMonth.month() + 1;

  useEffect(() => {
    loadReservations();
  }, [currentMonth]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reservationsApi.getByMonth(year, month);
      setReservations(data.filter((r: Reservation) => r.status === 'active'));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Error al cargar datos');
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
      loadReservations();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Error al crear reservación');
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await reservationsApi.cancel(reservationId, user.id);
      setSuccess('Reservación cancelada');
      loadReservations();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Error al cancelar reservación');
    }
  };

  // Reservaciones del usuario actual
  const myReservations = reservations.filter(r => r.houseId === user.id);

  // Mapa de fechas reservadas
  const reservedDates = new Map<string, Reservation>();
  reservations.forEach(r => {
    const dateStr = dayjs(r.date).format('YYYY-MM-DD');
    reservedDates.set(dateStr, r);
  });

  // Generar días del calendario
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDay = startOfMonth.day(); // 0 = domingo
    const daysInMonth = endOfMonth.date();

    const days: { date: dayjs.Dayjs | null; isCurrentMonth: boolean }[] = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ 
        date: currentMonth.date(d), 
        isCurrentMonth: true 
      });
    }

    return days;
  };

  const isToday = (date: dayjs.Dayjs) => date.isSame(dayjs(), 'day');
  const isPast = (date: dayjs.Dayjs) => date.isBefore(dayjs(), 'day');
  const isReserved = (date: dayjs.Dayjs) => reservedDates.has(date.format('YYYY-MM-DD'));
  const isMyReservation = (date: dayjs.Dayjs) => {
    const r = reservedDates.get(date.format('YYYY-MM-DD'));
    return r && r.houseId === user.id;
  };

  const getReservationInfo = (date: dayjs.Dayjs) => {
    return reservedDates.get(date.format('YYYY-MM-DD'));
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = dayjs();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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
      {myReservations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mis Reservaciones
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {myReservations.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: theme.palette.primary.light + '20',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {dayjs(r.date).format('dddd, D MMMM YYYY')}
                  </Typography>
                  {r.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {r.notes}
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => handleCancelReservation(r.id)}
                >
                  Cancelar
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Calendario */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <IconButton onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Días de la semana */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
          {weekDays.map((day) => (
            <Typography key={day} align="center" variant="body2" fontWeight="bold" color="text.secondary">
              {day}
            </Typography>
          ))}
        </Box>

        {/* Días del mes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {calendarDays.map((item, index) => {
            if (!item.date) {
              return <Box key={index} sx={{ height: 60 }} />;
            }

            const date = item.date;
            const dateStr = date.format('YYYY-MM-DD');
            const reserved = isReserved(date);
            const myRes = isMyReservation(date);
            const past = isPast(date);
            const todayDate = isToday(date);

            // Solo permitir reservar días futuros y del mes actual
            const canReserve = !past && date.month() === today.month() && date.year() === today.year() && !reserved;

            return (
              <Box
                key={index}
                onClick={() => canReserve && !myRes && setOpenDialog(true) || canReserve && setSelectedDate(dateStr)}
                sx={{
                  height: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  cursor: canReserve && !myRes ? 'pointer' : 'default',
                  bgcolor: 
                    myRes ? theme.palette.primary.main :
                    reserved ? theme.palette.error.light :
                    todayDate ? theme.palette.grey[200] :
                    'transparent',
                  color: 
                    myRes ? 'white' :
                    reserved ? theme.palette.error.dark :
                    past ? theme.palette.grey[400] :
                    'inherit',
                  border: todayDate && !reserved ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                  borderColor: 
                    todayDate && !reserved ? theme.palette.primary.main :
                    theme.palette.grey[300],
                  opacity: past ? 0.6 : 1,
                  '&:hover': canReserve && !myRes ? {
                    bgcolor: theme.palette.primary.light,
                    color: 'white',
                  } : {},
                }}
              >
                <Typography variant="body1" fontWeight={todayDate ? 'bold' : 'normal'}>
                  {date.format('D')}
                </Typography>
                {reserved && !myRes && (
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                    Casa {getReservationInfo(date)?.house.lotNumber}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Leyenda */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.primary.main, borderRadius: 0.5 }} />
            <Typography variant="body2">Tu reservación</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.error.light, borderRadius: 0.5 }} />
            <Typography variant="body2">No disponible</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, border: '2px solid', borderColor: theme.palette.primary.main, borderRadius: 0.5 }} />
            <Typography variant="body2">Hoy</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Dialog para nueva reservación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nueva Reservación</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {selectedDate && dayjs(selectedDate).format('dddd, D MMMM YYYY')}
          </Typography>
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
          >
            Reservar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;