const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken')
const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();
const port = 3000;

const userModel = require("./models/user");
const postModel = require('./models/post')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", async (req, res) => {
  let { name, username, email, age, password } = req.body;

    let user = await userModel.findOne({email});

    if(user) return res.status(500).send("User Already! Register!");


  bcrypt.genSalt(10,  (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {

        const createUser = await userModel.create({
            name,
            username,
            email,
            age,
            password: hash,
        });
        let token = jwt.sign({email: email, userid : user._id}, "secret")
        res.cookie("token", token)
        res.send("User Register Done!");
        res.redirect("/")
    });
    
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port port`);
});
