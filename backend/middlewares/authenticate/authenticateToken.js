const {RouterError}=require('../../utils/helperFunctions')
const jwt=require('jsonwebtoken')
const accessSecret=process.env.ACCESS_TOKEN_SECRET

const authenticateToken=(req,res,next)=>{
    const authHeaders=req.headers["authorization"];
    const token= authHeaders&& authHeaders.split(" ")[1];
    if(token==null){
        return next (new RouterError(`You are not logged in`,401,"AUTH_REQUIRED"))
    }
    jwt.verify(token,accessSecret,(err,userObject)=>{
        if(err){
            return next (new RouterError(`You are not logged in`,401,"INVALID_TOKEN"))
        }
        req.user=userObject
        next()

    })

}

module.exports={authenticateToken}