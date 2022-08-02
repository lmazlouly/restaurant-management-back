const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticated, hasPermission } = require('../middlewares');
const prisma = new PrismaClient()

router.get(
  '/orders',
  [ authenticated ],
  async ( req, res ) => {
    const queryBuilder = [];
    const orders = await prisma.order.findMany({  });
    return res.json(orders)
  }
)