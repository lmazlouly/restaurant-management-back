const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
/**
 * Here You do all the routing ignore all above
 */

/** Install Route (Disable this route later) */
const installRouteDisabled = false;
router.get('/install', async (req, res) => {
  if ( installRouteDisabled )
    return res.status(200).json('Route Disabled');
  /** Creating Permissions */
  let permissions = [
    // Permission CRUD Access
    { name: 'permission' },
    // Role CRUD Access
    { name: 'role' },
    // User CRUD Access
    { name: 'user' },
    /** Admin */
    { name: 'admin' },
    /** Chef */
    { name: 'chef' },
    /** Servant */
    { name: 'servant' },
    /** Cashier */
    { name: 'cashier' },
  ]
  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });
  permissions = await prisma.permission.findMany({ where: { name: 'admin' } });
  let servantPermission = await prisma.permission.findFirst({ where: { name: 'servant' } });
  /** Creating Role */
  const adminRole = { name: 'admin' }
  const cashierRole = { name: 'cashier' }
  const servantRole = { name: 'servant' }
  const chefRole = { name: 'chef' }
  await prisma.role.createMany({
    data: [
      adminRole,
      cashierRole,
      servantRole,
      chefRole,
    ],
    skipDuplicates: true
  });
  let admin = await prisma.role.findFirst({
    where: {
      name: adminRole.name
    },
  });
  /** Creating First Admin */
  let user = { username: 'dev', password: process.env.DEFAULT_ADMIN_PASSWORD, roleId: admin.id }
  await prisma.user.createMany({
    data: [user],
    skipDuplicates: true
  });
  user = await prisma.user.findFirst({
    where: {
      username: user.username
    }
  })
  /** Syncing Admin role with all possible access */
  let adminHasParms = [];
  for (let i = 0; i < permissions.length; i++) {
    let isExists = await prisma.roleHasPermission.count({ where: {roleId: admin.id, permissionId: permissions[i].id}});
    if ( !isExists )
      adminHasParms.push({ roleId: admin.id, permissionId: permissions[i].id });
  }
  await prisma.roleHasPermission.createMany({
    data: adminHasParms,
    skipDuplicates: true,
  });
  let servant = await prisma.role.findFirst({ where: { name: servantRole.name }})
  let chef = await prisma.role.findFirst({ where: { name: chefRole.name }})
  let chefPermission = await prisma.permission.findFirst({ where: { name: 'chef' }})
  let cashier = await prisma.role.findFirst({ where: { name: cashierRole.name }})
  let cashierPermission = await prisma.permission.findFirst({ where: { name: 'cashier' }})
  await prisma.roleHasPermission.createMany({
    data: [
      /** Servant */
      { permissionId: servantPermission.id, roleId: servant.id },
      /** Chef */
      { permissionId: chefPermission.id, roleId: chef.id },
      /** Cashier */
      { permissionId: cashierPermission.id, roleId: cashier.id },
    ],
    skipDuplicates: true,
  });
  return res.status(200).json('Installed Successfully')
})
module.exports = router;