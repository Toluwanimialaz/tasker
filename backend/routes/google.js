var express = require('express');
var router = express.Router();
const initailizeGoogle=require('../config-passportgAuth')
const passport=require('passport');
const collection=require('../config');
const session=require('express-session');

router.use(passport.initialize())
router.use(passport.session())

initailizeGoogle(
    passport,
    async(username)=>await collection.findOne({password:username._json.sub})
)

router.get('/auth/google',passport.authenticate('google',{scope:['profile']}))

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:"/login"}),(req,res)=>{
    res.redirect(`${process.env.REACT_URL}/home`)
})




module.exports=router