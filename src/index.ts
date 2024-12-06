import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getMovieLists } from './controllers/movieController';

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json());

// Route to get movie lists
router.get('/movies/:year', async (req: Request, res: Response) => {
  await getMovieLists(req, res);
});

app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default app;
