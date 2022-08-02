const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticated, hasPermission } = require('../middlewares');
const prisma = new PrismaClient()

router.get(
  '/tables',
  [ authenticated ],
  async ( req, res ) => {
    const products = await prisma.product.findMany();
    return res.json(products);
  }
)

router.post(
  '/table',
  [ authenticated, hasPermission('admin') ],
  async ( req, res ) => {
    const { name, price, url } = req.body;
    const product = await prisma.product.create({
      data: {
        name: name,
        price: parseFloat(price),
        img: url,
      }
    })
    return res.json(product)
  }
)

router.delete(
  '/table/:id',
  [ authenticated, hasPermission('admin') ],
  async ( req, res ) => {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } })
    return res.json('deleted')
  }
)

module.exports = router;