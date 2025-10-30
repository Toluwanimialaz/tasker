
const express = require('express');
const router = express.Router();
const {collection,verifyCollection,tokenCollection}=require('../config')
const {sendWelcomeEmail,generateToken,checkOTP,retry,RouterError,sendSuccess}=require('../utils/helperFunctions')
const nodemailer = require('nodemailer');
const jwt=require('jsonwebtoken')
const { v4: uuidv4 } = require("uuid");
const crypto=require('crypto')
const {OAuth2Client} = require('google-auth-library');

const accessSecret=process.env.ACCESS_TOKEN_SECRET
const refreshSecret=process.env.REFRESH_TOKEN_SECRET
const reactURL=process.env.REACT_URL






async function getUserData(access_token) {

  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
  
  //console.log('response',response);
  const data = await response.json();
  console.log('data',data);
}



/* GET home page. */
router.post('/', async function(req, res, next) {

    const code = req.body.Google_code;
    const type=req.body.type;

    console.log(code);
    try {
        const redirectURL = type==="signup"? `${reactURL}/signup`:type==="login"?`${reactURL}/login`:`${reactURL}/home`   //"http://127.0.0.1:3050/oauth"
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
        );
        const r =  await oAuth2Client.getToken(code);
        // Make sure to set the credentials on the OAuth2 client.
        await oAuth2Client.setCredentials(r.tokens);
        console.info('Tokens acquired.');
        const user = oAuth2Client.credentials;
        console.log("user",user)
        console.log('credentials',user);
        //await getUserData(oAuth2Client.credentials.access_token);
        //process to get payload so you can set user in nice object
        const ticket=await oAuth2Client.verifyIdToken({idToken: user.id_token , audience: process.env.CLIENT_ID});
        //console.log("ticket:",ticket);

        const payload=ticket.getPayload();
        console.log('payload',payload)
        getUserData(user.access_token)

        const name=payload['name'];
        const userid=payload['sub'];
        const picture=payload['picture'];

        console.log(payload.email);
        
        const findUser=await collection.findOne({email:payload.email});
        if(!findUser){
          const user={
            email:payload.email,
            password:null,
            name:payload.name,
            id:uuidv4().toString(),
            provider:"google",
            displayPicture:payload.picture
          }

          if(type!=="signup"){
            throw new RouterError("you do not have an account please sign up",400,'BAD_REQUEST')
          }

          const verifyOtpNumber=crypto.randomInt(100000,999999).toString()

          let verifyUser={
            email:payload.email,
            verificationCode:verifyOtpNumber
          }
          console.log("sending mail")
          // await sendWelcomeEmail(user.email, user.name,verifyOtpNumber);
          const sentMail=await retry(sendWelcomeEmail,user.email, user.name,verifyOtpNumber);
          if(!sentMail){
              throw new RouterError(`could not sent verification email please try again later`,500,"EMAIL_SEND_ERROR") 
          }
          console.log(`Welcome email sent to ${user.email}`);
          const userData=await collection.insertMany(user)
          const tokenUser=await verifyCollection.insertMany(verifyUser)
          console.log("tokenuser",tokenUser)
          console.log("userdata",userData)
          return sendSuccess(res,{name:user.name,email:user.email},`registration successful, please check your email, ${user.email}`)
          // res.status(201).json({data:{user:{name:user.name,email:user.email}},message:`registration successful, please check your email for your email ${userData.email}`})
        }else{
            console.log("MY FINDUSER=",findUser)
            const userEmail=findUser.email;
            if(!findUser.isVerified){
                const verifyOtpNumber=crypto.randomInt(100000,999999).toString();
                const json=await checkOTP(userEmail,verifyOtpNumber,collection,verifyCollection)
                return sendSuccess(res,{message:json},`${userEmail} has been sent a verification code,please check your email`)
                // return res.json(json)
            }

            if(type==="home"){
              console.log("HOME ROUTE ACTIVE")
              const updated=await collection.findOneAndUpdate(
                { email: findUser?.email },
                { $set: { calendarToken: user.access_token,calendarRefreshToken:user.refresh_token,isGoogleRefreshToken:true } },
                {new:true}
              );

              return sendSuccess(res,{isGoogleRefreshToken:updated.isGoogleRefreshToken},`${findUser.email}'s integartion is complete `)
            }

            if(findUser.provider==="local"){
              console.log("find user is local and early return")
              throw new RouterError(`${userEmail} already has an account`,400,"BAD_REQUEST") 
            }

            if(type!=="login"){
              throw new RouterError("you already have an account please login",400,'BAD_REQUEST')
            }



            console.log('USER EXISTS BLOCK TRIGGERED')
            await collection.updateOne(
              { email: findUser?.email },
              { $set: { calendarToken: user.access_token,calendarRefreshToken:user.refresh_token} }
            );
            const accessObject=generateToken(jwt,{email:findUser?.email,name:findUser?.name})
            const findToken=await tokenCollection.findOne({email:userEmail})
            if(findToken){
                return sendSuccess(res,{user:{name:findUser.name,email:findUser.email},credentials:{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:findToken.refreshToken.id,refreshtokenExpiry:findToken.refreshToken.expiresAt},picture:findUser.displayPicture,provider:findUser.provider},`${userEmail} has successfully logged in`)
                // return res.json({data:{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:findToken.refreshToken.id,refreshtokenExpiry:findToken.refreshToken.expiresAt}})
            }else{
                const refresh_expiry=new Date(Date.now() +60* 60 * 1000).toISOString()
                const refreshToken=jwt.sign({email:findUser?.email,name:findUser?.name},refreshSecret)
                const insertToken=await tokenCollection.insertMany({email:userEmail,refreshToken:{id:refreshToken,expiresAt:refresh_expiry}})
                console.log("test to find out what insertToken returns",insertToken)
                return sendSuccess(res,{user:{name:findUser.name,email:findUser.email},credentials:{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:refreshToken,refreshtokenExpiry:refresh_expiry},picture:findUser.displayPicture,provider:findUser.provider},`${userEmail} has successfully logged in`)
                // return res.json({data:{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:refreshToken,refreshtokenExpiry:refresh_expiry}})
            }     
        }


      } catch (err) {
        console.log('Error logging in with OAuth2 user', err);
        next(err)
    }
});

module.exports = router;
