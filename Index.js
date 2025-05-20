import express from 'express'

import dotenv from 'dotenv'
import connectDB from './utils/db.js'

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
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})