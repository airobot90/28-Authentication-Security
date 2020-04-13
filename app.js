// npm init --y -> inicjalizuje node js., bo tworzy package.json
// npm i express
// npm i ejs
// npm i mongoose
// do szyfrowania hasel
// npm i mongoose-encryption
// npm i dotenv -> do tworzenia environment variables
// node app.js 
// aby w terminul przejsc na shell i wpisywac komendy z mongo musze wpisac mongo
// ABY USUNAC CALA BAZE UZYWAMY KOMENDY db.dropDatabase() W TERMINALU (wpierw musimy wpisac use ... (nazwa bazy) i sprawdzic za pomoca db czy jestesmy na dobrej bazie)

// DOTENV
// w taki sposob "implementuje sie dotenv
// tworzymy plik .env w folderze głównym projekty, ktory bedzie niewidoczny
// w tym pliku Add environment-specific variables on new lines in the form of NAME=VALUE
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// tworzymy strukture naszej bazy
const userSchema = new mongoose.Schema({
    // juz w schema moge dodac walidacje -> tutaj, ze pole name jest obowiazkowe do wypelnienia
    email: String,
    password: String,
});

// szyfrujemy haslo
// przeniesiono do env
// const secret = "Thisisourlittlesecret.";

// MUSI BYC PRZED const User = mongoose.model("User", userSchema), bo inaczej szyfrowanie nic nie da
userSchema.plugin(encrypt, {
    // process.env.SECRET pobiera nasz secret z pliku .env
    secret: process.env.SECRET,
    // mozemy tylko niektore pola zaszyfrowac. W naszym przypadku bedzie to haslo
    encryptedFields: ['password']
});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
})

app.get("/login", function (req, res) {
    res.render("login");
})

app.get("/register", function (req, res) {
    res.render("register");
})

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password,
    })

    newUser.save(function (err) {
        if (!err) {
            res.render("secrets");
        } else {
            console.log(err);
        }
    })
})

app.post("/login", function (req, res) {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        email: username,
    }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    });
})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});