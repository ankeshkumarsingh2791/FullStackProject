import mongoose from "mongoose"
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    role:{
        type: String,
        enum:["admin", "user"],
        default: "user"
    },
    name:{
        type: String,
        required: true,

    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,

    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    verificationToken:{
        type: String,
        default:null
    },
    restPasswordToken:{
        type: String
    },
    restPasswordExpiry:{
        type: Date
    }
}, {timestamps: true})

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();

})

const User = mongoose.model("User", userSchema)

export default User
