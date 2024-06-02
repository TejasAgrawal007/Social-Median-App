const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
const app = express()
const port = 3000


const userModel = require('./models/user')
const postModel = require('./models/post')

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/profile', isLoggedIn, (req,res) => {
    console.log(req.user);
    res.send("Welcome To Profile!")
})


app.post('/create', async (req, res) => {

    let {name, username, email, age, password} = req.body;

    let user = await userModel.findOne({email});

    if(user) return res.status(500).send("User Already exits!")

    bcrypt.genSalt(10,  (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            const user = await userModel.create({
                username,
                email,
                age,
                password : hash
            })
            let token = jwt.sign({email : email, userid : user._id}, "secret");
            res.cookie("token", token)
            res.send(user)
            
        })
    })
})


app.post('/login', async (req, res) => {

    let {email, password} = req.body;

    let user = await userModel.findOne({email});

    if(!user) return res.status(500).send("Something went wrong!");

    bcrypt.compare(password, user.password, function(err, result){

        if(result) {
            let token = jwt.sign({email : email, userid : user._id}, "secret");
            res.cookie("token", token)
            res.status(200).send("You can Login!");
        }
        else res.redirect('/login')
    })

})

app.get('/logout', (req, res) => {
    res.cookie("token", "")
    res.redirect('/login');
})


function isLoggedIn(req, res, next){
    if (req.cookies.token === "")  {
        res.send("You need to login first!");
    }else{
        let data = jwt.verify(req.cookies.token, "secret")
        req.user = data;
        next();
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port port`)
})