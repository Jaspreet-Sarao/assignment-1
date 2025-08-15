import express from 'express';
import path from 'path';
import { getDb } from './modules/db/db.js';
import { connect } from './modules/db/db.js';
import projectsRouter from './modules/projects/router.js';
import skillsRouter from './modules/skills/router.js';
import 'dotenv/config';

const __dirname = import.meta.dirname;
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;


app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3001',
    'https://your-portfolio-site.vercel.app' 
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Connect to MongoDB
const dbUrl = isProduction 
  ? process.env.MONGODB_URI 
  : `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

connect(dbUrl).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', projectsRouter);
app.use('/', skillsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Home route with error handling
app.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const [projectsCount, skillsCount, recentProjects, topSkills] = await Promise.all([
      db.collection('projects').countDocuments(),
      db.collection('skills').countDocuments(),
      db.collection('projects').find().sort({ date: -1 }).limit(3).toArray(),
      db.collection('skills').find().sort({ proficiency: -1 }).limit(5).toArray()
    ]);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      projectsCount,
      skillsCount,
      recentProjects,
      topSkills
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error', { error: err });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${port}`);
});