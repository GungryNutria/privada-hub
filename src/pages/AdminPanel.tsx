import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';
import { housesApi, House } from '../api/houses';
import { reservationsApi, Reservation } from '../api/reservations';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

function AdminPanel({ user }: AdminPanelProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [houses, setHouses] = useState<House[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog para cambiar PIN
  const [pinDialog, setPinDialog] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [newPin, setNewPin] = useState('');
  
  // Filtros
  const [searchLot, setSearchLot] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [housesData, reservationsData] = await Promise.all([
        housesApi.getAll(),
        reservationsApi.getByMonth(new Date().getFullYear(), new Date().getMonth() + 1),
      ]);
      setHouses(housesData);
      setReservations(reservationsData);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOwner = async (houseId: number, ownerName: string) => {
    // TODO: Implementar actualización de propietario
    console.log('Update owner', houseId, ownerName);
  };

  const filteredHouses = houses.filter(h => 
    searchLot === '' || h.lotNumber.toString().includes(searchLot)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Volver
          </Button>
          <Typography variant="h4">Panel de Administración</Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Casas" />
          <Tab label="Reservaciones" />
        </Tabs>
      </Paper>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : tab === 0 ? (
        // Tab de casas
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Buscar por número de casa"
              value={searchLot}
              onChange={(e) => setSearchLot(e.target.value)}
              size="small"
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Lote</TableCell>
                  <TableCell>Propietario</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHouses.slice(0, 50).map((house) => (
                  <TableRow key={house.id}>
                    <TableCell>{house.lotNumber}</TableCell>
                    <TableCell>{house.ownerName}</TableCell>
                    <TableCell>{house.phone || '-'}</TableCell>
                    <TableCell>{house.active ? 'Activo' : 'Inactivo'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedHouse(house);
                          setNewPin('');
                          setPinDialog(true);
                        }}
                      >
                        Reset PIN
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredHouses.length > 50 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Mostrando primeros 50 resultados de {filteredHouses.length}
            </Typography>
          )}
        </Paper>
      ) : (
        // Tab de reservaciones
        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Casa</TableCell>
                  <TableCell>Propietario</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {new Date(r.date).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>{r.house.lotNumber}</TableCell>
                    <TableCell>{r.house.ownerName}</TableCell>
                    <TableCell>{r.notes || '-'}</TableCell>
                    <TableCell>
                      {r.status === 'active' ? 'Activa' : 'Cancelada'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog para resetear PIN */}
      <Dialog open={pinDialog} onClose={() => setPinDialog(false)}>
        <DialogTitle>Resetear PIN - Casa {selectedHouse?.lotNumber}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nuevo PIN (4 dígitos)"
            fullWidth
            sx={{ mt: 2 }}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputProps={{ maxLength: 4 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Implementar reset de PIN
              console.log('Reset PIN for', selectedHouse?.id, 'to', newPin);
              setPinDialog(false);
            }}
            disabled={newPin.length !== 4}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPanel;