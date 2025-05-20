import mongoose from "mongoose"

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

const User = mongoose.model("User", userSchema)

export default User
