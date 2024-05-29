import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 1. 캐릭터 생성 api
// 1.1 nickName 값을 req.body로 받는다.
// 1.2 req.body로 받은 데이터와 일치하는 기존데이터가 있는지 확인              < 검증
// 1.3 character 생성
// 1.4 출력
router.post('/character-create', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { nickName } = req.body; //1.1
  const ExistingCharacter = await prisma.characters.findFirst({
    where: { nickName },
  }); //1.2
  if (ExistingCharacter) {
    return res
      .status(409)
      .json({ message: '이미 존재하는 캐릭터 닉네임입니다.' });
  }

  const character = await prisma.characters.create({
    //1.3
    data: {
      UserId: userId,
      nickName,
    },
  });

  return res
    .status(200)
    .json({ message: '캐릭터가 생성되었습니다.', data: character }); //1.4
});

// 2.캐릭터 상세정보 조회 api
// 2.1 인가 미들웨어(authorization)를 통해 얻어진 req.user 사용
// 2.2 req.user에서 얻은 userId와 일치하는 데이터를 Users와 연결된 Characters에서 가져오기
//     >>> 검증의 단계가 아닌 찾기의 목적/검증은 이미 authorization에서 수행했기 때문에 data는 반드시 존재함
// 2.3 출력
router.get('/myCharacter', authMiddleware, async (req, res, next) => {
  const { userId } = req.user; //2.1

  const user = await prisma.users.findFirst({
    //2.2
    where: { userId: +userId },
    select: {
      Characters: {
        select: {
          nickName: true,
          health: true,
          power: true,
          money: true,
        },
      },
    },
  });

  return res.status(200).json({ data: user }); //2.3
});

// 3. 캐릭터 정보 조회 api
// 3.1 캐릭터 닉네임을 req.body로 받기
// 3.2 req.body로 받은 닉네임이 존재한다면 [닉네임, 체력, 힘]데이터만 가져오기
// 3.3 존재하는지 검증
// 3.4 존재하는 경우 출력
router.get('/otherCharacter', async (req, res, next) => {
  const { nickName } = req.body; //3.1
  const character = await prisma.characters.findFirst({
    //3.2
    where: { nickName },
    select: {
      nickName: true,
      health: true,
      power: true,
    },
  });
  if (!character) {
    return res.status(409).json({ message: '존재하지 않는 닉네임입니다.' });
  } //3.3

  return res.status(200).json({ message: character }); //3.4
});

// 4. 캐릭터 삭제 api
router.delete('/deleteCharacter', authMiddleware, async (req, res, next) => {
  // const {userId} = req.user;
  const { nickName } = req.body;

  const character = await prisma.characters.findFirst({ where: { nickName } });
  if (!character) {
    return res
      .status(404)
      .json({ message: '해당 캐릭터가 존재하지 않습니다.' });
  }

  await prisma.characters.delete({ where: { nickName: character.nickName } });
  // await prisma.characters.delete({where:{nickName}});
  return res.status(200).json({ message: '캐릭터가 삭제되었습니다.' });
});
export default router;
