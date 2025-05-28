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
    const JwtToken = jwt.sign({id: user._id},process.env.JWT_SECRET || "shhhhh", {expiresIn: "1d"});
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

const getMe = async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("-password")

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      user
    })
    console.log("reached getMe")
  } catch (error){

  }
}

const logOutUser = async (req, res) => {
  try{
    res.cookie("token", null, {
      httpOnly: true,
      secure: true,
      maxAge: 0, // expires immediately
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error){
    
  }
}

const forgotPassword = async (req, res) => {
  try{

    const {email} = req.body;
    if(!email){
      return res.status(400).json({
        success: false,
        message: "Email is required"
      })
    }
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        success: false,
        message: "Invalid email"
      })
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.restPasswordToken = resetToken;
    user.restPasswordExpiry = Date.now() + 10 *60 * 1000; // 10 minutes
    await user.save();
    // send email:

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
      to: user.email,
      subject: "Verify your email",
      text: `Click on the link to reset your password: ${process.env.BASE_URL}/api/v1/users/verify/${resetPasswordToken}`,
    };
  
    await  transporter.sendMail(mailOptions)
    res.status(200).json({
      success: true,
      message: "Reset password link sent to your email"
    })



  } catch (error){
    res.status(400).json({
      success: false,
      message: "Error in forgot password",
      error: error.message
    })
  }
}

const resetPassword = async (req, res) => {
  try{
    const {token} = req.params;
    const {password, confirmPassword} = req.body;
    if(!token || !password || !confirmPassword){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }
    if(password !== confirmPassword){
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      })
    }
    const user = await User.findOne({
      restPasswordToken: token,
      restPasswordExpiry: { $gt: Date.now() } // check if token is not expired

    })
    // setting password
    if(!user){
      return res.status(400).json({
        success: false,
        message: "Invalid token or token expired"
      })
    }
    user.password = password;
    user.restPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    })
  
  } catch (error){
   
    res.status(400).json({
      success: false,
      message: "Error in resetting password",
      error: error.message
    })
  }
}




export { registerUser, verifyUser, LoginUser, logOutUser, resetPassword, getMe, forgotPassword };
