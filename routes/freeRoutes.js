const express = require("express");
const freeRoutes = express.Router();

const commonRoutes = require('./commonRoutes');
module.exports = freeRoutes;

freeRoutes
    .use(commonRoutes)
