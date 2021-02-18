require('dotenv').config();  // It should be always on top
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
// const bcrypt = require("bcryptjs");

require("./db/conn");
const Register = require("./models/registers")


const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views" );
const partials_path = path.join(__dirname, "../templates/partials" );

app.use(express.json()); // to get the json data from POSTMAN
app.use(express.urlencoded({extended:false})); // to get the json data fromm actual Form

app.use(express.static(static_path));
app.set("view engine", "hbs"); // for using views, we need to set it like this
app.set("views", template_path); // jo pehle mere views wala folder tha. ab wo template_path ho gaya hai
hbs.registerPartials(partials_path)

console.log(process.env.SECRET_KEY)

app.get("/", (req, res) => {
    res.render("index") // to set the template engine as default use 'res.render'
});
// app.get("/", (req, res) => {
//     res.send('hello from thapa technical')
// });

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");
})

// create a new user in our database
app.post("/register", async (req, res) => {
    try {

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){

            const registerEmployee = new Register({  // 'Register is already imported above'
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : password,  // we already stored the req.body above in password variable, so no need to write again
                confirmpassword : cpassword
            })

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part" + token);

            const registered = await registerEmployee.save();
            res.status(201).render('index'); // response code '201' is used for creating something

        } else {
            res.send("password is not matching")
        }

    } catch(error) {
        res.status(400).send(error);
    }
});

// login check

app.post("/login", async(req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        // Register.findOne(email)  // we can write only 'email' (object destructuring) cz both database & user entered email are same
        const useremail = await Register.findOne({email:email}); // 'find' is used to read the data
        // we will get all the data of the matched email in 'useremail'
        
        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken(); // usermail instead of registerEmployee
            console.log("the token part" + token);

        // if(useremail.password === password) {  // after bcrpt value changed to isMatch
        if(isMatch) {
            res.status(201).render('index');
            
        } else {
            res.send("invalid password details");
        }

    } catch (error) {
        res.status(400).send("invalid login details")
    }
})


const bcrypt = require("bcryptjs");


const securePassword = async (password) => {
    
    const passwordHash = await bcrypt.hash(password, 10);  // 10 is by default value. recommended to not use more rounds, as it will take more to register
    console.log(passwordHash);

    const passwordmatch = await bcrypt.compare(password, passwordHash); // passwordHash already presh in database using previous step
    console.log(passwordmatch);
}

securePassword("datta@123");

// **************************************************************************************************************
// Jwt.sign has two parameters i.e {Object} which contains a unique payload ex:- _id & 
// "secretkey" --> it should be minimum 32 characters long... the longer the better
// const jwt = require("jsonwebtoken");

// const createToken = async () => {
//     const token = await jwt.sign({_id:"602e2cdd899d471fecb66cac"}, "mynameisdattatreyabasavrajbagaledeveloper", {
//         expiresIn:"10 seconds"
//     })
//     console.log(token);

//     const userVer = await jwt.verify(token, "mynameisdattatreyabasavrajbagaledeveloper");
//     console.log(userVer);
// }

// createToken();



app.listen(port, () => {
    console.log(`server is running at port no ${port}`)
})