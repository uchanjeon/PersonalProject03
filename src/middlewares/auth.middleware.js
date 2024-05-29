import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

// 토큰 인증 미들웨어
// 1. req.cookies로부터 받은 쿠키중 accessToken 부분만 가져온다.
// 2. accessToken을 토큰 type과 scret key로 나눈다.
// 3. 토큰 검증
// 3.1 토큰 타입이 일치하지 않는 경우 에러 발생
// 3.2 토큰의 비밀키가 일치하지 않는 경우 catch 구문으로 이동시킴
// 3.3. jwt의 userId로 사용자 조회 후 존재하지 않을 경우 에러 발생
// 4. req.user에 조회된 사용자 정보 할당
export default async function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: '인증 헤더가 제공되지 않았습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

    const userId = decodedToken.userId; //3.3
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: '토큰에 해당하는 사용자를 찾을 수 없습니다.' });
    }

    req.user = user; //4.
    next();
  } catch (error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      case 'JsonWebTokenError':
        return res.status(401).json({ message: '토큰 인증에 실패했습니다.' });
      default:
        return next(error);
    }
  }
}
