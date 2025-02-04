const express = require("express");
const routes = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const auth = require("../auth/auth")();
const db = require("../data/quotes");
const cfg = require("../auth/config");

const saltRounds = 10;

const commonRoutes = require('./commonRoutes');
module.exports = routes;

routes
    // ----- routes non protégées
    .post("/signup", (req, res) => {
            console.log("données postées :", req.body);
            db.get('SELECT 1 FROM user WHERE user_name = $name',
                {$name: req.body.name},
                async (err, row) => {
                    if (err) {
                        return res.json(err);
                    }
                    if (row) {
                        return res.status(403).json("username already used");
                    }

                    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                        db.get("insert into user(user_name,user_password) values ($name,$password) returning user_id",
                            {
                                $name: req.body.name,
                                $password: hash
                            },
                            (err, row) => {
                                if (err) {
                                    return res.status(401).json(err);
                                }
                                return res.status(201).json({id: row.user_id});
                            });
                    })
                });
        }
    )
    .post("/signin", (req, res) => {
        console.log("données :", req.body);
        db.get('SELECT * FROM user WHERE user_name = $name',
            {$name: req.body.name},
            async (err, row) => {
                if (err) {
                    return res.json(err);
                }
                if (!row) {
                    return res.status(401).json("bad user");
                }
                const match = await bcrypt.compare(req.body.password, row.user_password);
                if (match) {
                    const token = jwt.sign({id: row.user_id}, cfg.jwtSecret, {expiresIn: "1h"});
                    return res.json({token: token});
                }
                res.status(401).json("bad password");
            })
    })
    .use(auth.initialize())
    // ----- routes protégées
    .use(auth.authenticate(),commonRoutes)

