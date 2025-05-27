import mongoose from "mongoose";
import User from "../models/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const newUser = await User.create({
      name,
      email,
      password,
    });

    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: "User not registered",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");

    newUser.verificationToken = token;
    await newUser.save();
    // send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,

      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USER, // generated ethereal user
        pass: process.env.MAILTRAP_PASS, // generated ethereal password
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_USER,
      to: newUser.email,
      subject: "Verify your email",
      text: `Click on the link to verify your email: ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    };
  
      await  transporter.sendMail(mailOptions)

      res.status(200).json({
        success: true,
        message: "User registered successfully"
      })
  } catch (error) {
        res.status(400).json({
            success: false,
            message:" User not registered"
        })
  }
};

const verifyUser = async (req, res)=> {
  // get token from url
  // validate token
  // find user by token
  // if not found, return error
  // set isVerified field true
  // remove vrification token
  // save
  // return response


  const {token} = req.params;
  if(!token){
    return res.status(400).json({
      message: "Invalid token"
    });
  }

  const user =  await User.findOne({verificationToken: token})

  if(!user){
    return res.status(400).json({
      success: false,
      message: "Invalid token"
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "User verified successfully"
  });
}

const LoginUser = async (req, res) => {
  const {email, password} = req.body;
  if(!email || !password){
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    })
  }

  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      })
    }
// matching password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch);
    if(!isMatch){
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      })
    }
// checking user is verified or not
    if(!user.isVerified){
      return res.status(400).json({
        success: false,
        message: "User not verified, please check your email"
      })
    }
    // generating jwt token
    const JwtToken = jwt.sign({id: user._id},"shhhhh", {expiresIn: "1d"});
  // cookie options 
    const cookieOptions = {
      httpOnly: true, // cannot be accessed by client side scripts
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24hr
    }
    res.cookie("token", JwtToken, cookieOptions)
// sending response
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: JwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "User not logged in",
      error: error.message

    })
  }
}



export { registerUser, verifyUser, LoginUser };
