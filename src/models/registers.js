const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname : {
        type: String,
        required: true
    },
    lastname : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique : true
    },
    gender : {
        type: String,
        required: true
    },
    phone : {
        type: Number,
        required: true,
        unique: true
    },
    age : {
        type: Number,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    confirmpassword : {
        type: String,
        required: true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

// Whenever we call a function through an instance, we need to define that function using 'methods' as below
employeeSchema.methods.generateAuthToken = async function() {
    try {
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY); // require jwt
        this.tokens = this.tokens.concat({token:token}); // if key and value both r same, directly u can write tokens
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
}


// 'pre' is used to run the function before running the save function.
// 'isModified' is used to run the below function only when there is need to first time password or to update password.
// here we used traditional function instead of callback function... cz 'this' keyword is not supported by callback function.
employeeSchema.pre("save", async function(next) {

    if(this.isModified("password")){

        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);

    }
    next();
})

// now we need to create a Collection

const Register = new mongoose.model("Register", employeeSchema); // collection name should be singular and must start with a Capital letter

module.exports = Register;