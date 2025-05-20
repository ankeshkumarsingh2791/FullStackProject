import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected")
})
.catch((err) => {
    console.log(`MongoDB connection error: ${err}`)
})
}

export default connectDB