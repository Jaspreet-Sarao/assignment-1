import express from 'express';
import path from 'path';
import { connect } from './modules/db/db.js';
import projectsRouter from './modules/projects/router.js';
import skillsRouter from './modules/skills/router.js';
import 'dotenv/config';

const __dirname = import.meta.dirname;
const app = express();
const port = process.env.PORT || 3000;

// Validate environment variables
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI not configured');
  process.exit(1);
}

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3001',
  'https://your-portfolio-site.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/skills', skillsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    db: 'connected',
    timestamp: new Date()
  });
});

// Home route
app.get('/', async (req, res) => {
  try {
    const db = (await import('./modules/db/db.js')).getDb();
    const [projects, skills, projectsCount, skillsCount] = await Promise.all([
      db.collection('projects').find().sort({ date: -1 }).limit(3).toArray(),
      db.collection('skills').find().sort({ proficiency: -1 }).limit(5).toArray(),
      db.collection('projects').countDocuments(),
      db.collection('skills').countDocuments()
    ]);
    
    res.render('admin/dashboard', {
      title: 'Dashboard',
      projects,
      skills,
      projectsCount,
      skillsCount
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error', { error: err });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server after DB connection
connect()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    
    // Keep the server alive
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });