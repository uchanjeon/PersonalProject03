import express from 'express';
import bcrypt from 'bcrypt';
import dotEnv from 'dotenv';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
// import authMiddleware from "../middlewares/auth.middleware.js";

dotEnv.config();

const router = express.Router();

// 1. 회원가입 api
// 1.1.   email, password, name, age, gender 값을 body로 데이터를 받기
// 1.2.   req.body로 받은 데이터와 일치하는 기존데이터가 있는지 확인              < 검증
// 1.2.1  기존 데이터는 prisma의 데이터에 있는 Users에 저장된 값으로 확인
// 1.3.   기존 데이터가 없다면 새롭게 생성
// 1.4.   해당 데이터를 기준으로 userinfo에 저장
// 1.5.   출력하기
router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, password, name, age, gender } = req.body; // 1.1.

    const ExistingUser = await prisma.users.findFirst({
      // 1.2.
      where: { email },
    });
    if (ExistingUser) {
      return res.status(409).json({ message: '이미 가입한 회원입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //1.3.
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    await prisma.userInfos.create({
      //1.4.
      data: {
        UserId: user.userId,
        name,
        age,
        gender: gender.toUpperCase(),
      },
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' }); //1.5.
  } catch (err) {
    next(err);
  }
});

// 2. 로그인 api
// 2.1.   email, password값을 body로 데이터를 받기
// 2.2.   req.body로 받은 데이터와 일치하는 기존데이터(Users)가 있는지 확인              < 검증
// 2.2.1  email은 prisma의 데이터에 있는 Users에 저장된 값으로 확인
// 2.2.2  password도 prisma의 데이터에 있는 Users에 저장된 값으로 확인
// 2.3.   토큰 생성
// 2.4.   jwt 제공
// 2.5.   출력하기
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body; //2.1.

  const user = await prisma.users.findFirst({ where: { email } }); //2.2.1
  if (!user) {
    return res.status(401).json({
      message: '[email이 존재하지 않거나] password가 일치하지 않습니다.',
    });
  }
  const userPassword = await bcrypt.compare(password, user.password); //2.2.2
  if (!userPassword) {
    return res.status(401).json({
      message: 'email이 존재하지 않거나 [password가 일치하지 않습니다.]',
    });
  }

  const accessToken = jwt.sign(
    { userId: user.userId },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: '10000s' }
  );

  return res
    .status(200)
    .json({ accessToken, message: '로그인이 완료되었습니다.' }); //2.5.
});

export default router;
