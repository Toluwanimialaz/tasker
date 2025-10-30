const {RateLimiterMemory}=require('rate-limiter-flexible');
const { limiter } = require('./Rate-LimiterDummy');

const MAX_REQUEST_LIMIT=20;
const MAX_REQUEST_WINDOW=60*15;
const ERROR_MESSAGE="Too Many Requets";

const options={
    duration:MAX_REQUEST_WINDOW,
    points:MAX_REQUEST_LIMIT
}

const rateLimiter=new RateLimiterMemory(options)

const Limiter=(req,res,next)=>{
    rateLimiter
    .consume((req.headers['x-forwarded-for']||"").split(",")[0]!==""?(req.headers['x-forwarded-for']||'').split(",")[0]:req.ip)
    .then((rateLimterRes)=>{
        res.setHeader("Retry-After",rateLimterRes.msBeforeNext/1000);
        res.setHeader("X-RateLimit-Limit",MAX_REQUEST_LIMIT);
        res.setHeader("X-RateLimit-Remaining",rateLimterRes.remainingPoints);
        res.setHeader("X-RateLimit-Reset",new Date(Date.now()+rateLimterRes.msBeforeNext));
        next()
    })
    .catch((error)=>{
        console.log(error)
        res.status(429).json({message:ERROR_MESSAGE})
    })
}

module.exports={
    Limiter
}
