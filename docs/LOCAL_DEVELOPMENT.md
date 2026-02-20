# Local Development Guide

## Quick Start

### Start Both Servers (Recommended)

```bash
npm run dev:all
```

This starts:
- **Frontend** (Vite): http://localhost:5173
- **Backend API** (Express): http://localhost:3002

### Start Servers Separately

**Terminal 1 - Backend API:**
```bash
npm run server
```
Runs Express.js API server on port 3002

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Runs Vite dev server on port 5173

## Prerequisites

1. **Node.js** 18+ installed
2. **Environment variables** configured in `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   API_PORT=3002
   ```

## Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run server` | Start Express API server (backend only) |
| `npm run dev:all` | Start both servers concurrently |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts:
```bash
npm install --legacy-peer-deps
```

### Port Already in Use

If port 5173 or 3002 is already in use:
- Kill existing processes: `lsof -ti:5173 | xargs kill` (for port 5173)
- Or change ports in `vite.config.ts` and `server.js`

### Environment Variables Missing

Ensure `.env` file exists in root directory with required variables.

## Testing Endpoints

### Frontend
- **Main App**: http://localhost:5173
- **Login**: http://localhost:5173/auth/login

### Backend API
- **Health Check**: http://localhost:3002/api/health
- **Properties API**: http://localhost:3002/api/properties
- **Properties Sections**: http://localhost:3002/api/properties/sections

## Development Tips

1. **Hot Module Replacement (HMR)**: Frontend changes auto-reload
2. **API Changes**: Restart `npm run server` after backend changes
3. **Environment Variables**: Changes to `.env` require server restart
4. **CORS**: Backend CORS is configured for `http://localhost:5173`

## Stopping Servers

Press `Ctrl+C` in the terminal running `npm run dev:all`

Or kill processes:
```bash
# Kill Vite
lsof -ti:5173 | xargs kill

# Kill Express server
lsof -ti:3002 | xargs kill
```
