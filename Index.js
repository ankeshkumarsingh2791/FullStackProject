import express from 'express'

import dotenv from 'dotenv'
import connectDB from './utils/db.js'
import userRoutes from './routes/user.routes.js'
dotenv.config()
const app = express()

const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.get("/api", (req, res) => {
    res.send("Hello Ankesh")
})

connectDB()

// user routes
app.use("/api/v1/users", userRoutes)
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})