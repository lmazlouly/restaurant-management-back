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
  ]
  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });
  permissions = await prisma.permission.findMany();
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
  return res.status(200).json('Installed Successfully')
})
module.exports = router;