const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticated, hasPermission } = require('../middlewares');
const prisma = new PrismaClient()

router.get(
  '/users',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const users = await prisma.user.findMany({ include: { role: true } })
    return res.json(users);
  }
);

router.post(
  '/user',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const { name, password, roleId } = req.body
    const user = await prisma.user.create({
      data: { 
        username: name,
        password: password,
        role: { connect: { id: parseInt(roleId) } }
      }
    })
    return res.json(user);
  }
);

router.put(
  '/user/:id',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const { id } = req.params
    const { username, password, roleId } = req.body
    const user = await prisma.user.update({
      data: { 
        username: username,
        password: password,
        role: { connect: { id: parseInt(roleId) } }
      },
      where: {
        id: parseInt(id)
      }
    })
    return res.json(user);
  }
);

router.delete(
  '/user/:id',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const { id } = req.params
    const user = await prisma.user.delete({ where: { id: parseInt(id) } })
    return res.json(user);
  }
);

module.exports = router;