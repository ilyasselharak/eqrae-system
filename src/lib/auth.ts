import { getDatabase } from './mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: string;
  username: string;
  password: string;
  email?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createUser(username: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
  const db = await getDatabase();
  const users = db.collection('users');
  
  // Check if user already exists
  const existingUser = await users.findOne({ username });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const userDoc = {
    username,
    email,
    password: hashedPassword,
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await users.insertOne(userDoc);
  return { ...userDoc, _id: result.insertedId.toString() };
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const db = await getDatabase();
  const users = db.collection('users');
  
  const user = await users.findOne({ username, isActive: true });
  if (!user) {
    return null;
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: user._id.toString() } as User;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const db = await getDatabase();
  const users = db.collection('users');
  
  const user = await users.findOne({ username });
  if (!user) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: user._id.toString() } as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDatabase();
  const users = db.collection('users');
  
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: user._id.toString() } as User;
}
