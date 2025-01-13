import { Request, Response } from 'express';
import pool from '../config/db';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const addTask = async (req: Request, res: Response) => {
  const { title, description } = req.body;

  try {
    await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2)',
      [title, description]
    );
    res.status(201).send('Task added');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
