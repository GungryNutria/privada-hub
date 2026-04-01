# Privada Hub Frontend

Panel de residentes para reservación de palapa.

## Tecnologías

- **Vite** - Build tool
- **React** - UI framework
- **Material UI** - Componentes
- **TypeScript** - Tipado
- **React Router** - Navegación

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar API

Por defecto, el frontend conecta con `http://localhost:3000/api` via proxy.

Para producción, crea `.env.production`:

```
VITE_API_URL=https://tu-api.com/api
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

El frontend corre en `http://localhost:5173`

## Funcionalidades

### Para Residentes

- **Login** - Acceso con número de casa + PIN
- **Ver disponibilidad** - Calendario del mes actual
- **Crear reservación** - Apartar día disponible
- **Cancelar reservación** - Liberar fecha propia
- **Ver mis reservaciones** - Historial personal

### Para Admin/Comité

- **Ver todas las casas** - Lista de residentes
- **Ver todas las reservaciones** - Control mensual
- **Resetear PINs** - En caso de olvido

## Build de Producción

```bash
npm run build
```

Los archivos se generan en `dist/`

## Estructura

```
src/
├── api/           # Clientes HTTP
├── pages/         # Páginas principales
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── AdminPanel.tsx
├── App.tsx        # Rutas y estado
└── main.tsx       # Entry point
```