const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next){
    const token = req.headers.token;

    if(!token){
        return res.status(401).json({
            message:"No token provided"
        })
    }

    try {
        const decodepayload = jwt.verify(token, JWT_SECRET);

        if(decodepayload){
            req.userId = decodepayload.userId
            next();
        }else{
            res.status(401).json({
                message:"user is not verified"
            })
        }
    } catch (error) {
        res.status(401).json({
            message:"Invalid or expired token"
        })
    }
}

module.exports = {
    auth
}