# Real-Time Crypto Trading Dashboard

This project is a real-time trading dashboard for the SOL/USDT trading pair, featuring a live order book and chart. It uses WebSockets to provide real-time updates from the Binance API.

## Project Structure

The project is divided into two main parts:

- `backend/`: Django-based backend server
- `frontend/`: Next.js-based frontend application

## Backend (Django)

The backend is responsible for connecting to the Binance WebSocket stream and relaying the data to the frontend.

### Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS and Linux: `source venv/bin/activate`

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

5. Copy the `.env.example` file to `.env` and fill in your Binance API credentials and other configuration details:
   ```
   cp .env.example .env
   ```

### Running the Backend

To start the backend server, use the following command:

```
daphne backend.asgi:application
```

This will start the ASGI server, which handles both HTTP and WebSocket connections.

## Frontend (Next.js)

The frontend is a Next.js application that connects to the backend WebSocket and displays the real-time order book and chart.

### Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required packages:
   ```
   npm install
   ```

### Running the Frontend

To start the frontend development server:

```
npm run dev
```

This will start the Next.js development server, typically on `http://localhost:3000`.

## Accessing the Application

Once both the backend and frontend servers are running, you can access the application by opening a web browser and navigating to `http://localhost:3000`.

## Features

- Real-time order book for SOL/USDT
- Live candlestick chart for SOL/USDT
- WebSocket connection to Binance for live data updates

## Technologies Used

- Backend:
  - Django
  - Channels (for WebSocket support)
  - Daphne (ASGI server)
  - python-binance (for Binance API integration)

- Frontend:
  - Next.js
  - React
  - WebSocket API
