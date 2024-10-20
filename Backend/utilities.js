const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next){
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    //no token, unauthorized
    if(!token) return res.status(401).send();

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        // token invalid, forbidden
        if(err) return res.status(401).send();
        req.user = user;
        next();
    })
}

module.exports={
    authenticateToken
}