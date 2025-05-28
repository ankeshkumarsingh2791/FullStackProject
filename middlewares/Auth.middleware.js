import jwt from 'jsonwebtoken';
export  const isLoggedIn = async (req, res, next) => {

    // Check if the user is logged in by checking for a token in cookies
    try{
        console.log(`checking cookies ${req.cookies}`)
        const token = req.cookies?.token
        console.log('token found', token ? "Yes" : "No")
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded token', decoded)

        req.user = decoded // Attach the user information to the request object
       
        next()

    } catch (error){
        console.log("Auth mid failed");
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }

}