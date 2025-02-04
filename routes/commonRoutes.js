const express = require("express");
const db = require("../data/quotes");
const {v4: uuidv4} = require("uuid");
const fs = require("fs");

const commonRoutes = express.Router();
module.exports = commonRoutes;

commonRoutes
    // ----- les infos
    .get('/test', (req, res) => {
        res.end('Server is running');
    })
    .get("/", (req, res) => {
        res.redirect('/help/help.html');
    })
    .get("/help", (req, res) => {
        res.redirect('/help/help.html');
    })
    .get("/users", (req, res) => {
        db.all(
            "select user_id as id, user_name as name, user_password as password from user",
            (err, rows) => {
                if (err) {
                    console.error("users ->", err);
                    res.sendStatus(500);
                } else {
                    res.json(rows)
                }
            })
    })
    // ----- les auteurs
    .get("/authors", (req, res) => {
            db.all(
                "select auth_id as id,auth_firstname as firstname, auth_lastname as lastname, auth_picture as picture from author a",
                (err, rows) => {
                    if (err) {
                        console.error("authors ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    .get("/authors/:id", (req, res) => {
            console.log("paramètres postés:", req.params);
            db.get(
                "select auth_id as id,auth_firstname as firstname, auth_lastname as lastname, auth_picture as picture from author a where a.auth_id=$id",
                {$id: req.params.id},
                (err, rows) => {
                    if (err) {
                        console.error("authors ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    .get("/authors/:id/quotes/", (req, res) => {
            console.log("paramètres postés:", req.params);
            db.all(
                "select quote_id as id, quote_text as text from quote where auth_id=$id",
                {$id: req.params.id},
                (err, rows) => {
                    if (err) {
                        console.error("authors ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    .post("/authors", (req, res) => {
        console.log("données postées:", req.body);
        console.log("fichier posté :", req.files);
        const index = req.files?.picture?.name.lastIndexOf(".");
        console.log("index=",index)
        if(req.files === null || index === undefined){
            return res.sendStatus(400);
        }
        const newFilename = uuidv4() + req.files.picture.name.substring(index);
        db.run("insert into author(auth_firstname,auth_lastname,auth_picture) values (?,?,?)",
            req.body.firstname, req.body.lastname,
            newFilename,
            // traitement du résultat de la requête
            async (err) => {
                if (err) { // en cas d'erreur affichage du message
                    console.error("Database error", err);
                    res.sendStatus(500);
                } else { // en cas succès transfert du fichier image dans /img
                    await req.files.picture.mv(__dirname + "/../img/" + newFilename);
                    res.sendStatus(201);
                }
            });
    })
    .delete("/authors/:id", (req, res) => {
        console.log("paramètres postés:", req.params);
        db.get("delete from author where auth_id=$id returning auth_picture", {$id: req.params.id},
            (err, row) => {
                if (row) {
                    fs.unlink(__dirname + "/img/" + row.auth_picture, err => err && console.error(err));
                    res.sendStatus(204);
                } else if (err) {
                    console.error("Database error", err);
                    res.sendStatus(500);
                } else {
                    res.sendStatus(202);
                }
            });
    })
    .put("/authors/:id", (req, res) => {
        console.log("données postées:", req.body);
        console.log("fichier posté :", req.files);
        let newFilename = "";
        if (!!req.files) {
            const index = req.files.picture.name.lastIndexOf(".");
            newFilename = uuidv4() + req.files.picture.name.substring(index);
            db.run("update author set auth_firstname=$firstname, auth_lastname=$lastname, auth_picture=$picture where auth_id=$id", {
                    $firstname: req.body.firstname,
                    $lastname: req.body.lastname,
                    $picture: newFilename,
                    $id: req.params.id
                },
                async (err) => {
                    if (err) {
                        console.error("Database error", err);
                        res.sendStatus(500);
                    } else {
                        await req.files.picture.mv(__dirname + "/img/" + newFilename);
                        res.sendStatus(204);
                    }
                })
        } else {
            db.run("update author set auth_firstname=$firstname, auth_lastname=$lastname where auth_id=$id", {
                    $firstname: req.body.firstname,
                    $lastname: req.body.lastname,
                    $id: req.params.id
                },
                async (err) => {
                    if (err) {
                        console.error("Database error", err);
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(204);
                    }
                })
        }
    })
    // ----- les citations avec leur auteur
    .get("/quotes-ext", (req, res) => {
            db.all(
                "select " +
                "quote_id as qid, quote_text as qtext, " +
                "author.auth_id as aid,auth_firstname as afirstname, auth_lastname as alastname, auth_picture as apicture " +
                "from author join quote where author.auth_id = quote.auth_id",
                (err, rows) => {
                    if (err) {
                        console.error("quotes ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    .get("/quotes-ext/:id", (req, res) => {
            db.get(
                "select " +
                "quote_id as qid, quote_text as qtext, " +
                "author.auth_id as aid,auth_firstname as afirstname, auth_lastname as alastname, auth_picture as apicture " +
                "from author join quote on author.auth_id = quote.auth_id where " +
                " quote_id = ?", req.params.id,
                (err, rows) => {
                    if (err) {
                        console.error("quotes ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    // ----- les citations sans l'auteur
    .get("/quotes", (req, res) => {
            db.all(
                "select " +
                "quote_id as qid, quote_text as qtext,auth_id as aid " +
                "from quote ",
                (err, rows) => {
                    if (err) {
                        console.error("quotes ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    .get("/quotes/:id", (req, res) => {
            db.get(
                "select " +
                "quote_id as qid, quote_text as qtext,auth_id as aid " +
                "from quote where " + " quote_id = ?", req.params.id,
                (err, rows) => {
                    if (err) {
                        console.error("quotes ->", err);
                        res.sendStatus(500);
                    } else {
                        res.json(rows)
                    }
                })
        }
    )
    .post("/quotes",
        (req, res) => {
            console.log("données postées:", req.body);
            db.run("insert into quote(quote_text,auth_id) values (?,?)",
                req.body.text, req.body.id,
                // traitement du résultat de la requête
                async (err) => {
                    if (err) { // en cas d'erreur affichage du message
                        console.error("Database error", err);
                        res.sendStatus(500);
                    } else { // en cas succès
                        res.sendStatus(201);
                    }
                });
        })
    .delete("/quotes/:id",
        (req, res) => {
            console.log("paramètres postés:", req.params);
            db.run("delete from quote where quote_id=$id", {$id: req.params.id},
                (err) => {
                    if (err) {
                        console.error("Database error", err);
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(202);
                    }
                });
        })
