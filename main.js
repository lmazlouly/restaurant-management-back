require('dotenv').config({path: __dirname + '/.env'})
/** Express */
const express = require('express');
/** Using PrismaClient (Prisma ORM) */
const { PrismaClient } = require('@prisma/client');
/** Generating Tokens Via JWT */
const jwt = require('jsonwebtoken');
const tokenSecret = process.env.SECRET;
/** Middlewares will be seperated */
const { authenticated, hasPermission } = require('./middlewares');
/** Cors is to enable REST API requests from other servers rather than localhost:3000 */
const cors = require('cors');
const corsOptions = {
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200
}
/** Body parser since some browsers tend to use form data */
const bodyParser = require("body-parser");
const app = express()
app.use(express.json())
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static('public'));
/** Add  routes here */
app.use(require('./routes/install'));
app.use(require('./routes/auth'));
const server = app.listen(3000)
console.log('listening on localhost:3000');