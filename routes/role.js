const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticated, hasPermission } = require('../middlewares');
const prisma = new PrismaClient()

router.get(
  '/permissions',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const permissions = await prisma.permission.findMany();
    return res.json(permissions);
  }
);

router.get(
  '/roles',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const roles = await prisma.role.findMany({ include: { RoleHasPermissions: { include: { permission: true } } } })
    return res.json(roles);
  }
);

router.post(
  '/role',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const { name, permissions } = req.body
    const queryBuilder = {};
    queryBuilder.name = name;
    if ( permissions.length > 0 ) {
      queryBuilder.RoleHasPermissions = { createMany: { data: [], skipDuplicates: true } }
      for (const permission of permissions) {
        queryBuilder.RoleHasPermissions.createMany.data.push({ permissionId: parseInt(permission.id) })
      }
    }
    const role = await prisma.role.create({ data: queryBuilder });
    return res.json(role);
  }
);

router.put(
  '/role/:id',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const { id } = req.params
    const { name, permissions } = req.body
    const queryBuilder = {};
    queryBuilder.name = name;
    if ( permissions.length > 0 ) {
      queryBuilder.RoleHasPermissions = { createMany: { data: [], skipDuplicates: true } }
      for (const permission of permissions) {
        queryBuilder.RoleHasPermissions.createMany.data.push({ permissionId: parseInt(permission.id) })
      }
    }
    await prisma.roleHasPermission.deleteMany({
      where: {
        roleId: parseInt(id)
      }
    })
    const role = await prisma.role.update({ where: { id: parseInt(id) }, data: queryBuilder });
    return res.json(role);
  }
);

router.delete(
  '/role/:id',
  [ authenticated, hasPermission('admin') ],
  async (req, res) => {
    const { id } = req.params
    const role = await prisma.role.delete({ where: { id: parseInt(id) }, include: { RoleHasPermissions: true } })
    return res.json(role);
  }
);

module.exports = router;