const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const session = require("express-session");
const app = express();

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "db_article",
});

app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: "my-session-secret",
        saveUninitialized: false,
        resave: false,
    }),
);

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home.ejs", { title: "Home Page" });
});

app.use((req, res, next) => {
    if (req.session.username === undefined) {
        res.locals.yourName = "Guest";
        res.locals.isLoggedIn = false;
    } else {
        res.locals.yourName = req.session.username;
        res.locals.isLoggedIn = true;
    }

    next();
});

app.get("/articles", (req, res) => {
    connection.query("SELECT * FROM article", (error, results) => {
        res.render("articles.ejs", {
            title: "Articles Page",
            articles: results,
        });
    });
});

app.get("/article/:id", (req, res) => {
    res.render("article", { title: "Detail Article Page" });
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login Page" });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    connection.query(
        `SELECT * FROM users WHERE email='${email}'`,
        (error, results) => {
            if (results.length > 0) {
                if (password === results[0]["passwords"]) {
                    req.session.username = results[0]["username"];
                    res.locals.isLogged = true;

                    res.redirect("/articles");
                } else {
                    res.redirect("/articles");
                    res.locals.username = "Tamu";
                }
            } else {
                res.redirect("/articles");
                res.locals.username = "Tamu";
            }
        },
    );
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
});

app.listen(5000, () => {
    console.log("server berjalan di http://localhost:5000");
});
