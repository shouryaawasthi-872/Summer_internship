require('dotenv').config();
// Force Node.js to use Google DNS (8.8.8.8) so MongoDB SRV records resolve
// correctly on networks where the default DNS blocks SRV lookups.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin requests (Postman, curl, mobile apps)
    if (!origin) return cb(null, true);
    // Allow any localhost port (local dev)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return cb(null, true);
    // Allow any Vercel deployment (*.vercel.app covers preview + production)
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    // Allow the explicit FRONTEND_URL env var (custom domain)
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return cb(null, true);
    // Allow Render preview URLs (for testing)
    if (origin.endsWith('.onrender.com')) return cb(null, true);
    cb(new Error(`CORS: origin not allowed → ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/internships',   require('./routes/internship.routes'));
app.use('/api/applications',  require('./routes/application.routes'));
app.use('/api/documents',     require('./routes/document.routes'));
app.use('/api/meetings',      require('./routes/meeting.routes'));
app.use('/api/marks',         require('./routes/marks.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/cgpa',          require('./routes/cgpa.routes'));

app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}`);
  console.log(`   Frontend expected at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
