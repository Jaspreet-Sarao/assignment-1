import { getDb } from '../db/db.js';
import { ObjectId } from 'mongodb';

export async function getSkills() {
  const db = getDb();
  return await db.collection('skills').find().sort({ proficiency: -1 }).toArray();
}

export async function addSkill(skill) {
  const db = getDb();
  skill.proficiency = parseInt(skill.proficiency);
  const result = await db.collection('skills').insertOne(skill);
  return result.insertedId;
}

export async function deleteSkill(id) {
  const db = getDb();
  const result = await db.collection('skills').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}

export async function getSkillById(id) {
  const db = getDb();
  return await db.collection('skills').findOne({ _id: new ObjectId(id) });
}

export async function updateSkill(id, updates) {
  const db = getDb();
  updates.proficiency = parseInt(updates.proficiency);
  const result = await db.collection('skills').updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  return result.modifiedCount;
}

export default {
  getSkills,
  addSkill,
  deleteSkill,
  getSkillById,
  updateSkill
};