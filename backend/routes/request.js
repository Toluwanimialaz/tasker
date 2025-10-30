const express=require('express');
const router=express.Router();
const {OAuth2Client}=require('google-auth-library');



const reactURL=process.env.REACT_URL
/*GET USER*/  
router.get("/",async function(req,res,next){
    console.log("received")
    res.header("Access-Control-Origin-Allow-Origin","http://losthost:5173");
    res.header("Referrer-Policy","no-referrer-when-downgrade");
    const type=req.query.type
    console.log(type)

   try{
    const redirectURL = type==="signup"? `${reactURL}/signup`:type==="login"?`${reactURL}/login`:`${reactURL}/home`; //'http://127.0.0.1:3050/oauth';

    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectURL
    );

  
    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile  openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events ',
        prompt: 'consent'
    });

    console.log("auth_url",authorizeUrl)
  
    res.json({url:authorizeUrl})
   }catch(error){
     next(error)
   }
})

module.exports=router;