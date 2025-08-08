# DDoS Testing and Monitoring Web Application

A real-time DDoS testing and monitoring web application with dual-server architecture for testing and visualization.

## Features

- **DDoS Target Server (Port 2011)**
  - Accepts all HTTP requests
  - Detailed request logging (IP, timestamp, headers, etc.)
  - Apache Common Log format support
  - Real-time stats emission

- **Dashboard Server (Port 2025)**
  - Real-time monitoring UI
  - Top attackers visualization
  - RPS graphs with Chart.js
  - Live request streaming
  - Filtering capabilities

## Setup

1. Clone the repository:
```bash
git clone https://github.com/lehungquangminh/web-test-ddos.git
cd web-test-ddos
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (optional):
Edit `.env` file to change ports, logging settings, etc.

4. Start both servers:
```bash
npm run dev
```

## Usage

1. Open dashboard: `http://localhost:2025/dashboard`
2. Send requests to target: `http://localhost:2011`
3. Watch real-time updates on dashboard

## Configuration

Edit `.env` file to configure:
- Server ports
- Log file path
- Rate limiting
- CORS settings

## Technology Stack

- Node.js + Express.js
- Socket.IO for real-time communication
- Chart.js for visualization
- Bootstrap for UI
