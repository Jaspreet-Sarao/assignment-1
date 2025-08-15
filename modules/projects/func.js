import { getDb } from '../db/db.js';
import { ObjectId } from 'mongodb';

export async function getProjects() {
  const db = getDb();
  return await db.collection('projects').find().sort({ date: -1 }).toArray();
}

export async function addProject(project) {
  const db = getDb();
  project.date = new Date();
  project.technologies = project.technologies.split(',').map(t => t.trim());
  project.featured = project.featured === 'on';
  const result = await db.collection('projects').insertOne(project);
  return result.insertedId;
}

export async function deleteProject(id) {
  const db = getDb();
  const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}

export async function getProjectById(id) {
  const db = getDb();
  return await db.collection('projects').findOne({ _id: new ObjectId(id) });
}

export async function updateProject(id, updates) {
  const db = getDb();
  updates.technologies = updates.technologies.split(',').map(t => t.trim());
  updates.featured = updates.featured === 'on';
  const result = await db.collection('projects').updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  return result.modifiedCount;
}

export default {
  getProjects,
  addProject,
  deleteProject,
  getProjectById,
  updateProject
};