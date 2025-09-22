# GreenHarvest Frontend-Backend Connection Setup

## Quick Start

### Option 1: Using the provided scripts

**Start Backend:**
```powershell
cd backend
npm start
```

**Start Frontend (in a new terminal):**
```powershell
cd frontend
npm run dev
```

### Option 2: All-in-one startup script

Run this in PowerShell from the project root:

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Wait a moment for backend to start
Start-Sleep 3

# Start frontend
cd frontend; npm run dev
```

## Connection Details

- **Backend Server**: http://localhost:5000
- **Frontend Server**: http://localhost:5173
- **API Base URL**: http://localhost:5000/api

## Available API Endpoints

- `GET /` - Server status check
- `GET /debug` - Environment variables debug info
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/products` - Get all products
- `GET /api/cart` - Get user cart
- `POST /api/orders` - Create new order

## Testing the Connection

1. Open your browser to http://localhost:5173
2. Look for the "Backend Connection Status" section on the home page
3. Click "Test Connection Again" to verify the connection

## Troubleshooting

### Backend not starting:
- Check if port 5000 is available
- Verify MongoDB connection string in .env file
- Run `npm install` in the backend directory

### Frontend not connecting:
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure Vite proxy is configured correctly

### CORS Issues:
- Backend is configured to accept requests from http://localhost:5173 and http://localhost:3000
- If using a different port, update the CORS configuration in backend/index.js

## Development Notes

- The frontend uses Vite's proxy feature to forward `/api` requests to the backend
- Environment variables are set in frontend/.env for API configuration
- JWT tokens are stored in localStorage for authentication
- The connection test component is included on the home page for easy testing