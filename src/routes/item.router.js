import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// item 생성 api
router.post('/itemCreate', async (req, res, next) => {
  const { itemName, itemPrice, Health, Power } = req.body;

  const checkItem = await prisma.items.findFirst({ where: { itemName } });
  if (checkItem) {
    return res.status(400).json({ message: '이미 존재하는 아이템입니다.' });
  }

  try {
    const newItem = await prisma.items.create({
      data: {
        itemName,
        itemPrice,
        Health,
        Power,
      },
    });

    return res
      .status(200)
      .json({ message: '아이템이 생성되었습니다.', data: newItem });
  } catch (error) {
    return res
      .status(500)
      .json({ message: '아이템 생성 중 오류가 발생했습니다.' });
  }
});

// item 수정 api
router.patch('/alterItem', async (req, res, next) => {
  const { itemName, newItemName, Health, Power } = req.body;

  const checkItem = await prisma.items.findFirst({ where: { itemName } });
  if (!checkItem) {
    return res
      .status(400)
      .json({ message: '해당 아이템이 존재하지 않습니다.' });
  }

  const updateItem = await prisma.items.update({
    where: { itemName },
    data: {
      itemName: newItemName,
      Health,
      Power,
    },
  });

  return res
    .status(200)
    .json({ message: '아이템이 수정되었습니다.', data: updateItem });
});

// item 목록 조회 api
router.get('/itemList', async (req, res, next) => {
  const itemList = await prisma.items.findMany({
    select: {
      itemId: true,
      itemName: true,
      itemPrice: true,
    },
  });
  return res.status(200).json({ itemList });
});

// item 상세 조회 api
router.get('/itemDetail', async (req, res, next) => {
  const { itemName } = req.body;

  const itemDetail = await prisma.items.findFirst({ where: { itemName } });
  if (!itemDetail) {
    return res
      .status(400)
      .json({ message: '해당 아이템이 존재하지 않습니다.' });
  }

  return res.status(200).json({ itemDetail });
});

export default router;
