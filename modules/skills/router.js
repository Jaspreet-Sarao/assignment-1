import express from 'express';
const router = express.Router();
import model from './func.js';

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Admin routes
router.get('/admin/skills', async (req, res) => {
  try {
    const skills = await model.getSkills();
    res.render('admin/skills-list', { 
      title: 'Manage Skills', 
      skills: skills 
    });
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.get('/admin/skills/add', (req, res) => {
  try {
    console.log('Rendering skills-add page');
    res.render('admin/skills-add', { title: 'Add Skill' });
  } catch (err) {
    console.error('Error rendering skills-add page:', err);
    res.status(500).render('error', { error: err });
  }
});

router.post('/admin/skills/add', async (req, res) => {
  try {
    await model.addSkill(req.body);
    res.redirect('/api/skills/admin/skills');
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.get('/admin/skills/edit/:id', async (req, res) => {
  try {
    const skill = await model.getSkillById(req.params.id);
    res.render('admin/skills-edit', { 
      title: 'Edit Skill', 
      skill: skill 
    });
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.post('/admin/skills/edit/:id', async (req, res) => {
  try {
    await model.updateSkill(req.params.id, req.body);
    res.redirect('/api/skills/admin/skills');
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

router.get('/admin/skills/delete/:id', async (req, res) => {
  try {
    await model.deleteSkill(req.params.id);
    res.redirect('/api/skills/admin/skills');
  } catch (err) {
    res.status(500).render('error', { error: err });
  }
});

// API routes
router.get('/', async (req, res) => {
  try {
    const skills = await model.getSkills();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;