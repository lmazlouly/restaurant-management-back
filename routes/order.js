const express = require('express');
const router = express.Router();
const { PrismaClient, OrderStatus } = require('@prisma/client');
const { authenticated, hasPermission } = require('../middlewares');
const prisma = new PrismaClient()

router.get(
  '/order/:id',
  [ authenticated ],
  async ( req, res ) => {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(req.params.id) },
      include: { orderProducts: { include: { product: true } } }
    })
    return res.json(order);
  }
)

router.get(
  '/orders',
  [ authenticated ],
  async ( req, res ) => {
    const orderBy = [];
    const queryBuilder = {};
    const role = await prisma.role.findFirst({ where: { id: parseInt(req.user.roleId) }, include: { RoleHasPermissions: { include: { permission: true } } } })
    if ( role.RoleHasPermissions.find(p => p.permission.name == 'servant') )
      queryBuilder.OR = [ { status: OrderStatus.ALERTED }, { status: OrderStatus.READY }, { status: OrderStatus.NEW } ]
    if ( role.RoleHasPermissions.find(p => p.permission.name == 'chef') )
      queryBuilder.OR = [ { status: OrderStatus.ALERTED }, { status: OrderStatus.READY }, { status: OrderStatus.NEW } ]
    if ( role.RoleHasPermissions.find(p => p.permission.name == 'cashier') )
      queryBuilder.OR = [ { status: OrderStatus.SERVED } ]
    const orders = await prisma.order.findMany(
      {
        orderBy: { createdAt: 'desc' },
        where: queryBuilder,
        include: { orderProducts: true }
      }
    );
    return res.json(orders)
  }
)

router.post(
  '/order',
  [ authenticated ],
  async ( req, res ) => {
    const { products } = req.body;
    const orderProducts = [];
    for (const product of products) {
      orderProducts.push({ productId: product.productId, amount: product.amount })
    }
    await prisma.order.create({
      data: {
        status: OrderStatus.NEW,
        orderProducts: { createMany: { data: orderProducts } }
      }
    })
    return res.json('created')
  }
)

router.put(
  '/order/:id',
  [ authenticated ],
  async ( req, res ) => {
    const { status, comment } = req.body;
    const query = {};
    if ( status ) query.status = status;
    if ( comment ) query.comment = comment;
    await prisma.order.update({ where: { id: parseInt(req.params.id) }, data: query });
    return res.json('updated')
  }
)

router.delete(
  '/order/:id',
  [ authenticated ],
  async ( req, res ) => {
    await prisma.order.update({ where: { id: parseInt(req.params.id) }, data: { orderProducts: OrderStatus.CANCELED } });
    return res.json('deleted')
  }
)

module.exports = router;