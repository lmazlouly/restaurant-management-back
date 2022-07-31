const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken');
const tokenSecret = process.env.SECRET;
const { authenticated, hasPermission, required } = require('../middlewares');

router.get('/isLogged', [authenticated], async (req, res) => {
  const role = await prisma.userHasRole.findFirst({ where: { userId: parseInt(req.user.id) }}).role();
  const roleHasPermissions = await prisma.roleHasPermission.findMany({ where: { roleId: role.id} });
  const permissionsIds = roleHasPermissions.map(rhp => rhp.permissionId);
  const permissions = await prisma.permission.findMany({ where: { id: { in: permissionsIds } }})
  return res.status(200).json({ permissions: permissions, role: role});
})
/** Login */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if ( !username || !password )
    return res.status(422).json(req.body);
    // return res.status(422).json('Please username & password');
  const user = await prisma.user.findFirst({
    where: {
      username: username,
      password: password
    }
  });
  if ( !user || !(user.password === password) )
    return res.status(422).json('Bad credentials');
  return res.json(await generateToken(user))
})
/** Sign Up */
const signUpRouteDisabled = true;
router.post('/signup', async (req, res) => {
  if ( signUpRouteDisabled )
    return res.json('Sign up is disabled')
  const { username, password } = req.body
  if ( !username || !password )
    return res.status(422).json('Bad credentials');
  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  })
  res.json(user);
})

async function generateToken(user) {
  return jwt.sign({data: user}, tokenSecret, { 'expiresIn': '24h' })
}

module.exports = router;