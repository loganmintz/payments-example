# Gem Balance System with RON Integration

A full-stack application for managing gem balances using Ronin blockchain. This system allows tracking and modifying gem balances based on both blockchain contracts and game-based modifiers.

## Project Purpose

This application serves as a gem economy system for games on the Ronin blockchain. It provides:

- Connection to the Ronin blockchain to read contract balances
- Conversion of RON/contract balances to gem values
- A modifier system to add or subtract gems without changing blockchain state
- Transaction history tracking
- API endpoints for managing balances and modifiers

## Project Structure

```
.
├── backend/           # TypeScript/Express backend
│   ├── src/           # Source code
│   │   ├── config/    # Database and app configuration
│   │   ├── entities/  # Database entity definitions
│   │   ├── routes/    # API route definitions
│   │   ├── services/  # Business logic services
│   │   └── index.ts   # Main application entry point
│   └── package.json   # Backend dependencies
├── frontend/          # React frontend
│   ├── public/        # Static assets
│   ├── src/           # Source code
│   │   ├── components/# UI components
│   │   ├── pages/     # Page components
│   │   ├── App.tsx    # Main application component
│   │   └── index.tsx  # Entry point
│   └── package.json   # Frontend dependencies
└── README.md          # Project documentation
```

## Features

- Connect to Ronin blockchain to read balances
- Convert RON balances to gem values
- Display gem balances with modifiers
- Add or subtract gems via modifiers
- Store transaction and balance history in PostgreSQL
- Full API for managing balances and modifiers

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Ronin wallet (for testing)

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   CONTRACT_ADDRESS=0x2fee44f36baa6382d18c020005b341c01ffcfca5
   RONIN_RPC_URL=https://saigon-testnet.roninchain.com/rpc
   DATABASE_URL=postgres://username:password@localhost:5432/gembalance
   PORT=3001
   ```
   (Replace database credentials with your own)

4. Initialize the PostgreSQL database:
   ```bash
   # Login to PostgreSQL and create the database
   psql -U postgres
   CREATE DATABASE gembalance;
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will start on port 3001 and automatically create the required tables.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   PORT=3002 npm start
   ```
   This will start the application on port 3002 to avoid conflicts with the backend.

## API Endpoints

### Balance Endpoints

- `GET /api/balance/:address` - Get RON wallet balance
- `GET /api/gems/:address` - Get gem balance with modifiers
- `POST /api/gems/:address` - Update gem balance

### Modifier Endpoints

- `GET /api/modifiers/:address` - Get modifier balance
- `POST /api/modifiers/set/:address` - Set a new modifier value
- `POST /api/modifiers/add/:address` - Add to modifier balance
- `POST /api/modifiers/subtract/:address` - Subtract from modifier balance

## Using the Application

1. The dashboard displays your current gem balance (base + modifiers)
2. Your wallet's RON balance is converted to a base gem balance
3. Use the modifier form to add or subtract gems for game actions
4. All changes are stored in the database for persistence

## Technology Stack

- **Frontend**: React, Material-UI, ethers.js
- **Backend**: Node.js, Express, TypeScript, TypeORM
- **Database**: PostgreSQL
- **Blockchain**: Ronin (Ethereum compatible)

## Development Notes

- The backend automatically syncs with the blockchain on startup
- The modifier system allows game logic to adjust balances without blockchain transactions
- All balances are automatically recalculated when fetched 