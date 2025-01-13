import express, { Request, Response } from 'express';
import pool from './config/db';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Route example
app.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server f*cked up');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
