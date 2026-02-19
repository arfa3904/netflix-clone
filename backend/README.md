# Netflix Clone Backend

Backend API server for Netflix Clone using Node.js, Express, and MySQL (Aiven).

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env` and update with your Aiven MySQL credentials:

```env
DB_HOST=your-aiven-host.a.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your_password_here
DB_NAME=defaultdb
```

**How to get Aiven MySQL credentials:**
1. Log in to [Aiven Console](https://console.aiven.io/)
2. Select your MySQL service
3. Go to "Overview" → Copy the connection details
4. Use the host, port, username, and password from there

### 3. Run the Server

```bash
node server.js
```

Or for development with auto-reload:

```bash
npm run dev
```

## API Endpoints

- `GET /` - Health check (returns "Backend is running")
- `GET /api/test-db` - Test database connection

## Project Structure

```
backend/
├── .env              # Environment variables (not in git)
├── .gitignore        # Git ignore rules
├── package.json      # Dependencies and scripts
├── db.js            # MySQL connection setup
├── server.js        # Express server
└── README.md        # This file
```

## Troubleshooting

### Database Connection Failed

1. **Check .env file** - Ensure all variables are set correctly
2. **Verify Aiven credentials** - Double-check host, port, username, password
3. **Check SSL** - Aiven requires SSL (already configured in db.js)
4. **Firewall** - Ensure your IP is whitelisted in Aiven (if required)

### Port Already in Use

Change the port in `server.js`:
```javascript
const PORT = process.env.PORT || 5000; // Change 5000 to another port
```

## Dependencies

- **express** - Web framework
- **mysql2** - MySQL client with promise support
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
