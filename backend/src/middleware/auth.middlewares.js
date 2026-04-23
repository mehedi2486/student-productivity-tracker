const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next){
    const token = req.headers.token;

    const user = jwt.verify(token, JWT_SECRET);

    if(user){
        userId = req.userId
        next();
    }else{
        res.status(401).json({
            message:"user is not varified"
        })
    }
}

module.exports = {
    auth
}