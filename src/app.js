import express from 'express';
import cookieParser from 'cookie-parser';
import dotEnv from 'dotenv';
import UsersRouter from './routes/user.router.js';
import CharacterRouter from './routes/character.router.js';
import ItemRouter from './routes/item.router.js';
import errorHandingMiddleware from '../src/middlewares/error-handing.middleware.js';

dotEnv.config();

const app = express();
const PORT = process.env.DATABASE_PORT;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter, CharacterRouter, ItemRouter]);
app.use(errorHandingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸습니다.');
});
