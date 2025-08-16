import express from 'express';
const router = express.Router();
import model from './func.js';

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Admin routes
router.get('/admin/projects', async (req, res) => {
  try {
    const projects = await model.getProjects();
    res.render('admin/projects-list', { 
      title: 'Manage Projects', 
      projects: projects 
    });
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.get('/admin/projects/add', (req, res) => {
  res.render('admin/projects-add', { title: 'Add Project' });
});

router.post('/admin/projects/add', async (req, res) => {
  try {
    await model.addProject(req.body);
    res.redirect('/api/projects/admin/projects');
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.get('/admin/projects/edit/:id', async (req, res) => {
  try {
    const project = await model.getProjectById(req.params.id);
    res.render('admin/projects-edit', { 
      title: 'Edit Project', 
      project: project 
    });
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.post('/admin/projects/edit/:id', async (req, res) => {
  try {
    await model.updateProject(req.params.id, req.body);
    res.redirect('/api/projects/admin/projects');
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.get('/admin/projects/delete/:id', async (req, res) => {
  try {
    await model.deleteProject(req.params.id);
    res.redirect('/api/projects/admin/projects');
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

// API routes
router.get('/', async (req, res) => {
  try {
    const projects = await model.getProjects();
    res.json(projects); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;