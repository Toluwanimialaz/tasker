if(process.env.NODE_ENV!=="production"){
    console.log("ready to go in testing")
    require('dotenv').config()
}

const reactURL=process.env.REACT_URL
const accessSecret=process.env.ACCESS_TOKEN_SECRET
const refreshSecret=process.env.REFRESH_TOKEN_SECRET
const allowedOrigins=[reactURL,`${reactURL}/`,`${reactURL}/home`]

const cors=require('cors')
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Only allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With'], // Allow specific headers
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 204
};

const {z}=require('zod')
const { google } = require("googleapis");
const {OAuth2Client} = require('google-auth-library');
const bodyParser=require('body-parser')
const express= require('express');
const pathh=require('path')
const {collection,verifyCollection,tokenCollection}=require('./config')
const app=express();
app.set('trust proxy', 1);
const port=process.env.PORT || 3050;
// const initializePassport=require('./config-passport');
// const passport=require('passport');
// const flash=require('express-flash')
// const session=require('express-session')
// const methodOverride=require('method-override')
// const mongoStore=require('connect-mongo');
const jwt=require('jsonwebtoken')
const nodemailer = require('nodemailer');
const crypto=require('crypto')
const transporter = nodemailer.createTransport({
    service:"gmail",
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // 
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email username
        pass: process.env.EMAIL_PASSWORD // Your email password
    }
});

const {bcrypt,bcryptVerify}=require('hash-wasm');
const {Limiter}=require('./middlewares/Rate-limiter/Rate-Limiter')
const { v4: uuidv4 } = require("uuid");
const{sendSuccess,RouterError,retry,createCalendarEvent,beforeSymbol}=require('./utils/helperFunctions');
const {errorHandler}=require('./middlewares/ErrorHandler/ErrorHandler')
// const { Collection } = require('mongoose');



// initializePassport(
//     passport,
//     async(username)=>await collection.findOne({name:username})
// )
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.set('views', pathh.join(__dirname, 'views'));
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
// app.use(flash())
// app.use(session({
//     store: mongoStore.create({ mongoUrl:process.env.MONGODB_URI}),
//     secret:process.env.SESSION_SECRET,
//     resave:false,
//     saveUninitialized:false,
//     cookie: {
//        maxAge:1000*60*60*60,
//        secure: process.env.NODE_ENV === 'production'?true:false,
//        sameSite:'None',
//        httpOnly:process.env.NODE_ENV === 'production'?true:false,

//     }
// }))
// app.use(passport.initialize())
// app.use(passport.session())
// app.use(methodOverride('_method'))






// app.use((req, res, next) => {
//     console.log('Origin:', req.headers.origin);
//     console.log('Headers:', req.headers);
//     next();
// });

// app.use((req, res, next) => {
//     res.on('finish', () => {
//         console.log('Responseess Headers:', res.getHeaders());
//     });
//     next();
// });
  
// app.use((req, res, next) => {
//     console.log('Session ID:', req.sessionID);
//     console.log('User:', req.user);
//     next();
// });
const sendWelcomeEmail = async (userEmail, username,otp) => {

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Tasker App" <noreply@taskerapp.com>',
        to: userEmail,
        subject: 'Welcome to Tasker App!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333;">Welcome to Tasker App, ${username}!</h2>
                <p>This is your OTP, you can follow the link to verify your account</p>
                <div style="display:flex;align-items:center;justify-content:center;flex-direction:row">
                    <h2>${otp}</h2>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p>Click this<a href="${reactURL}/verify?mail=${userEmail}">link</a>to verify your email</p>
                    <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply directly to this email.</p>
                </div>
            </div>
        `
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
}



const checkOTP=async(email,OTP)=>{
    console.log("Checking token for:", email);
    const findUser=await collection.findOne({email:email})
    const findUnverifiedUser=await collection.findOne({email:email,isVerified:false})
    const doesTokenExist=await verifyCollection.findOne({email:email})
    console.log("Does token exist?", doesTokenExist);
    if(!findUser){
        throw new RouterError(`this user; ${email} is not registered`,400,"INVALID_REQUEST")
    }
    if(!findUnverifiedUser){
        throw new RouterError(`this user; ${email} is already verified`,400,"INVALID_REQUEST")
    }
    console.log("SECOND BLOCK TRIGGERED")
    if(doesTokenExist){
        throw new RouterError(`this user; ${email} still has a valid OTP`,400,"INVALID_REQUEST")
    }else{
        const sentMail=await retry(sendWelcomeEmail,email, findUnverifiedUser.name,OTP);
        if(!sentMail){
            throw new RouterError(`could not sent verification email please try again later`,500,"EMAIL_SEND_ERROR") 
        }
        const tokenUser=await verifyCollection.insertMany({email:email,verificationCode:OTP})
        console.log("tokenuser",tokenUser)
        return {data:`email successfully sent to ${email}`}
    }
}

const generateToken=(user)=>{
    try{
        const access_token= jwt.sign(user,accessSecret,{expiresIn:'20m'});
        const now=new Date();
        const access_expiry=new Date(now.getTime()+60*60*1000).toISOString();
        return{accessToken:access_token,accessExpiry:access_expiry}
    }catch(error){
        throw new RouterError("Failed to generate access token", 500, "TOKEN_GEN_ERROR")
    }
}

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

function toWATISOString(dateInput) {
    const date = new Date(dateInput); // Can be ISO string or Date object
    date.setHours(date.getHours() + 1);
    return date;
}

////FLAGGED FOR DELETE
// function auhenticated(req,res,next){
//     if(req.isAuthenticated()){
//         console.log("User authenticated:", req.user);
//         next()
//     }else{
//         return res.redirect(`${reactURL}/login`)
//     }
// }

// function notAuthenticated(req,res,next){
//     if(req.isAuthenticated()){
//         return res.redirect(process.env.REACT_URL);
//     }else{
//         next()
//     }
// }

app.get("/ip",(req,res,next)=>{


    const iP=(req.headers['x-forwarded-for']||"").split(",")[0]!==""?(req.headers['x-forwarded-for']||'').split(",")[0]:req.ip
    res.json({data:{"Your ip":iP}})
})

app.get("/",(req,res)=>{
    res.status(200).json({data:{"working":"successs"}})
})

///FLAGGED FOR DELETE
// app.get("/api",(req,res)=>{
//     if(req.isAuthenticated()){
//         res.json({names:req.user.name,status:""})
//     }else{
//         res.auth="false";
//         const truth=res.auth;
//         console.log(truth)
//         res.json({names:"",status:truth})
//     }
// })

app.get("/test",Limiter,authenticateToken,(req,res)=>{
    return res.status(200).json({data:{status:{user:req.user},message:`${req.user.name} you good G`}})
})

app.post("/date",Limiter,authenticateToken,(req,res)=>{
    return res.status(200).json({data:{status:{user:req.user,date:req.body.date},message:`${req.user.name} you good G`}})
})

app.get("/update",authenticateToken,async(req,res,next)=>{
    try{
        const user=await collection.findOne({email:req.user.email});
        const redirectURL =`${reactURL}/home`;
        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
        );

        oAuth2Client.setCredentials({
            refresh_token: user.calendarRefreshToken,
        });
        const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

        const list=await calendar.events.list({
            auth: oAuth2Client,
            calendarId: "primary",
            timeMin: (new Date("2025-06-01")).toISOString(), // start range
            timeMax: (new Date("2025-09-30")).toISOString(), // end range
            singleEvents: true,  // expands recurring events
            orderBy: "startTime"
        })

        const calendarList=list.data.items
        const taskList=user.tasks

        for(taskItem of taskList ){
            for(calendarItem of calendarList){
                if(taskItem.description===calendarItem.summary){
                    const cleanedID=beforeSymbol(calendarItem.iCalUID,"@")
                    await collection.updateOne(
                        { email:req.user.email, "tasks.description":taskItem.description },
                        { $set: { "tasks.$.calendarEventId": cleanedID  } }
                    )
                    break
                    // await collection.updateOne(
                    //     {email:req.user.email},
                    //     {$set: {calendarEventId:calendarItem.iCalUID}}
                    // )
                    
                }
            }
            
        }

        // for (tasker of taskList){
        //     if(!tasker.calendarEventId){
        //         await collection.updateOne(
        //             { email:req.user.email }, // filter doc
        //             {
        //               $set: {
        //                 "tasks.$[elem].calendarEventId": "7n7jurnahullpo2nj5lbsqvhsc"
        //               }
        //             },
        //             {
        //               arrayFilters: [
        //                 { "elem.calendarEventId": { $exists: false } } // only update missing field
        //               ]
        //             }
        //           );
                  
        //     }
        //    }

        console.log("MY LIST=",list)
        return sendSuccess(res,list,`list successfully called/updated`,200)

        

    }catch(error){
        return next (new RouterError(`something went wrong`,500,"SERVER ERROR"))


    }
})





app.post("/api/form",authenticateToken,async(req,res,next)=>{
    const schema1= z.object({
        date:z.string(),
        type:z.string(),
        periodType:z.string(),
        // daysRepeated:z.array(z.string()),
        daysWeeksRepeated:z.string(),
        interval:z.number(),
        description:z.string()
    })

    const schema2=z.object({
        date:z.string(),
        type:z.string(),
        description:z.string()
    })

    const schema3= z.object({
        date:z.array(z.string()),
        type:z.string(),
        periodType:z.string(),
        daysWeeksRepeated:z.string(),
        description:z.string(),
        interval:z.number(),
    })

    const date=req.body.date;
    console.log(date);
    try{
        if(req.body.type==="period"&& (req.body.periodType!=="monthly"&&req.body.periodType!=="yearly")){
            const validate1=schema1.safeParse(req.body)
            if(!validate1.success){
                return next (new RouterError(`bad input credentials`,400,"INVALID_CREDENTIALS"))
            }
        }else if(req.body.type==="oneTime"){
            const validate2=schema2.safeParse(req.body)
            if(!validate2.success){
                return next (new RouterError(`bad input credentials`,400,"INVALID_CREDENTIALS"))
            }
        }else if(req.body.type==="period"&& (req.body.periodType==="monthly"||req.body.periodType==="yearly")){
            const validate3=schema3.safeParse(req.body)
            if(!validate3.success){
                return next (new RouterError(`bad input credentials`,400,"INVALID_CREDENTIALS"))
            }

        }else{
            return next (new RouterError(`bad credentials`,400,"INVALID_CREDENTIALS"))
        }
        const user=await collection.findOne({email:req.user.email});
        console.log("WAS USER FOUND",user)
        if(user){
            const newTask=req.body;
            console.log("COMPLETE TASK",newTask)
            // await collection.updateOne(
            //     { email: req.user.email },
            //     { $push: { tasks: newTask} }
            // );
            const redirectURL =`${reactURL}/home`;
            const oAuth2Client = new google.auth.OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                redirectURL
            );
            console.log("TOKEN FOR calendar=",user.calendarRefreshToken)
            oAuth2Client.setCredentials({
                refresh_token: user.calendarRefreshToken,
            });

            const event=createCalendarEvent(req.body.description,req.body.date,1,req.body.type,req.body.periodType,req.body.interval,req.body.daysWeeksRepeated);

            const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
            const response = await calendar.events.insert({
                calendarId: "primary", // user’s main calendar
                resource: event,
            });
            
            console.log("Event created:", response.data.htmlLink);
            console.log("response=",response.data);
            const calendarEventId=response.data.id;
            const updatedTask={
                ...newTask,
                ...(calendarEventId && {calendarEventId:calendarEventId})
            }

            await collection.updateOne(
                { email:req.user.email},
                { $addToSet: {tasks:updatedTask} }
            )

            


            const { credentials } = await oAuth2Client.refreshAccessToken();
            const newAccessToken=credentials.access_token;
            await collection.updateOne(
                { email: req.user.email },
                { $set: {calendarToken :newAccessToken} }
            );



            
            // user.tasks.push(tasker)
            // await user.save()
            // console.log(user._id)
            return sendSuccess(res,response,`received successfully`,200)
        }
    }catch(error){
        next(error)
    }
    
    res.json({data:{message:"received successfully"}})

})


// app.get("/homeee",auhenticated,(req,res)=>{
//     res.render("home",{name:req.user.name})
// })

// app.get("/login",notAuthenticated,(req,res)=>{
//     res.render("login",{errorMessage:""})
// })

// app.get("/signup",notAuthenticated,(req,res)=>{
//     res.render("signup")
// })

app.post("/signup",async(req,res,next)=>{
    // const verificationObject={email,verifyOtpNumber}
    try{
        const{email,username,password}=req.body
        if(!email||!username||!password){
            throw new RouterError(`incomplete credentials`,400,"BAD_REQUEST")
        }

        if(typeof(email)!=="string"||typeof(username)!=="string"||typeof(password)!=="string"){
            throw new RouterError(`bad credentials`,400,"BAD_REQUEST")
        }
        const verifyOtpNumber=crypto.randomInt(100000,999999).toString()
        console.log(`verifyOtp=${verifyOtpNumber}`);
        let user={
            name:req.body.username,
            password:req.body.password,
            email:req.body.email,
            id:uuidv4().toString(),
            provider:"local",
            displayPicture:null
        }

        let verifyUser={
            email:req.body.email,
            verificationCode:verifyOtpNumber
        }
    
        const finduser=await collection.findOne({email:user.email})
        if(finduser){
            throw new RouterError(`${email} already has an account`,400,"BAD_REQUEST")
        }else{
            const salt=new Uint8Array(16);
            const key = await bcrypt({
                password: user.password,
                salt, // salt is a buffer containing 16 random bytes
                costFactor: 11,
                outputType: 'encoded', // return standard encoded string containing parameters needed to verify the key
            });
            console.log(`hashedpassword: ${key}`)
            user.password=key;
            console.log(user.password)
           
            console.log("sending mail")
            const sentMail=await retry(sendWelcomeEmail,user.email, user.name,verifyOtpNumber);
            if(!sentMail){
                throw new RouterError(`could not sent verification email please try again later`,500,"EMAIL_SEND_ERROR") 
            }
            console.log(`Welcome email sent to ${user.email}`);
            const userData=await collection.insertMany(user)
            const tokenUser=await verifyCollection.insertMany(verifyUser)
            console.log("tokenuser",tokenUser)
            console.log("userdata",userData)
            return sendSuccess(res,{name:user.name,email:user.email},`registration successful, please check your email; ${user.email}`,201)
            // res.status(201).json({data:{user:{name:userData.name,email:userData.email}},message:`registration successful, please check your email for your email ${finduser.email}`})
        }
    }catch(error){
        next(error)
    }
})

app.post("/verify",async(req,res,next)=>{
    try{
        console.log(req.body)
        const verifyOtpNumber=req.body.Otp;
        const userEmail=req.body.email;
    
        const findToken=await verifyCollection.findOneAndDelete({
            email:userEmail,verificationCode:verifyOtpNumber});
        console.log("find token=",findToken)
        if(!findToken){
            throw new RouterError(`your Otp is incorrect or expired request another one`,401,"BAD_REQUEST") 
            // return res.status(401).json({error:{code:"Bad request",message:`your Otp is incorrect or expired request another one`}})
        }else{
            console.log("your Otp was found");
            const updated = await collection.findOneAndUpdate(
                { email: userEmail },
                { $set: { isVerified: true } },
                { new: true }
            );
            console.log("Updated collection:", updated);
            return sendSuccess(res,`${findToken.email} has successfully been verified`,`successfully verified,you can now login`)
        }
    }catch(error){
        next(error)
    }
})

app.post("/request-code",async(req,res,next)=>{
    try{
        const userEmail=req.body.email;
        const verifyOtpNumber=crypto.randomInt(100000,999999).toString()
        let verifyUser={
            email:req.body.email,
            verificationCode:verifyOtpNumber
        }
    
        const json=await checkOTP(userEmail,verifyOtpNumber)
        sendSuccess(res,{message:json},`${userEmail} has been sent a verification code,please check your email`)
        // return res.json(json)
        
    }catch(error){
        next(error)
    }

    // try{
    //     console.log("Checking token for:", userEmail);
    //     const findUnverifiedUser=await collection.findOne({email:userEmail,isVerified:false})
    //     const doesTokenExist=await verifyCollection.findOne({email:userEmail})
    //     console.log("Does token exist?", doesTokenExist);
    //     if(!findUnverifiedUser){
    //         return res.status(401).json({error:{code:"invalid request",message:`${req.body.email} is already verified or isn't a user`}})
    //     }
    //     console.log("SECOND BLOCK TRIGGERED")
    //     if(doesTokenExist){
    //         console.log("YOU ALREADY HAVE A VALID TOKEN")
    //         return res.status(403).json({error:{code:"invalid request",message:`${req.body.email} already has a valid token`}})
    //     }else{
    //         await sendWelcomeEmail(userEmail, findUnverifiedUser.name,verifyOtpNumber);
    //         const tokenUser=await verifyCollection.insertMany(verifyUser)
    //         console.log("tokenuser",tokenUser)
    //     }

    // }catch(error){
    //     console.log(error)
    // }
})


app.post("/login",async(req,res,next)=>{
    try{
        const userEmail=req.body.email;
        const userPassword=req.body.password;
        const salt=new Uint8Array(16);;
        const hashed=await bcrypt({
            password:req.body.password,
            salt,
            costFactor: 11,
            outputType: 'encoded',
        })
        const findUser=await collection.findOne({email:userEmail,password:hashed});
        if(!findUser){
            throw new RouterError(`This user does not exist,incorrect password or email`,400,"BAD_REQUEST") 
            // return res.json({error:{code:"invalid request",message:`This user does not exist,incorrect password or email`}})
        }
        if(!findUser.isVerified){
            const verifyOtpNumber=crypto.randomInt(100000,999999).toString();
            const json=await checkOTP(userEmail,verifyOtpNumber);
            sendSuccess(res,json,`${userEmail} has not been verified but has been sent a verification code`);
            // return res.json(json)
        }
        console.log('USER EXISTS BLOCK TRIGGERED')
        const accessObject=generateToken({email:findUser?.email,name:findUser?.name})
        const findToken=await tokenCollection.findOne({email:userEmail})
        if(findToken){
            return sendSuccess(res,{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:findToken.refreshToken.id,refreshtokenExpiry:findToken.refreshToken.expiresAt,isGoogleRefreshToken:findUser.isGoogleRefreshToken,provider:findUser.provider},`${userEmail} has successfully logged in`);
            // return res.json({data:{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:findToken.refreshToken.id,refreshtokenExpiry:findToken.refreshToken.expiresAt}})
        }else{
            const refresh_expiry=new Date(Date.now() +60* 60* 1000).toISOString()
            const refreshToken=jwt.sign({email:findUser?.email,name:findUser?.name},refreshSecret)
            const insertToken=await tokenCollection.insertMany({email:userEmail,refreshToken:{id:refreshToken,expiresAt:refresh_expiry}})
            sendSuccess(res,{user:{name:findUser.name,email:findUser.email},accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:refreshToken,refreshtokenExpiry:refresh_expiry,isGoogleRefreshToken:findUser.isGoogleRefreshToken,provider:findUser.provider},`${userEmail} has successfully logged in`);
            // return res.json({data:{accessToken:accessObject?.accessToken,tokenExpiry:accessObject?.accessExpiry,refreshToken:refreshToken,refreshtokenExpiry:refresh_expiry}})
        }
    }catch(err){
        next(err)
    }

})

app.post("/token",async(req,res,next)=>{
    try{
        const tokens=req.body.token;
        if (!tokens || typeof tokens !== 'string') {
            throw new RouterError(`Refresh token is required and must be a string`,400,"BAD_REQUEST") 
            // return res.status(400).json({ error: 'Refresh token is required and must be a string' });
        }
        const findtoken=await tokenCollection.findOne({'refreshToken.id':tokens})
        console.log(findtoken)
        if(!findtoken){
            throw new RouterError(`Invalid refresh token`,401,"BAD_CREDENTIALS") 
            // return res.status(403).json({error:{message:"invalid refresh token"}})
        }
        console.log("database refreshtoken=",findtoken?.refreshToken?.id)
        const userObj=jwt.verify(tokens,refreshSecret,(err,userObject)=>{
            if(err){
                if (err.name === 'TokenExpiredError') {
                    throw new RouterError(`Your token has expired`,401,"BAD_CREDENTIALS")
                  } else if (err.name === 'JsonWebTokenError') {
                    throw new RouterError(`token verification error`,500,"JSONWEBTOKEN_FAILURE")
                  } else {
                    throw new RouterError(`token verification failed`,401,"TOKEN_ERROR")
                  }
            }

            return userObject
        })
        console.log("userObj=",userObj)
        const accessObject=generateToken({email:userObj?.email,name:userObj?.name})
        return sendSuccess(res,{accessToken:accessObject?.accessToken,accessExpiry:accessObject?.accessExpiry},`successfully refreshed token`);
        // return res.status(200).json({data:{accessToken:accessObject?.accessToken,accessExpiry:accessObject?.accessExpiry}})
    }catch(error){
        next(error)
        // console.log(error)
        // return res.status(403).json({ error: 'Bad refresh token' });
    }
})



// app.post("/login",notAuthenticated,passport.authenticate('local',{
//     successRedirect:`${reactURL}/home` ,
//     failureRedirect:`${reactURL}`,
//     failureFlash:true
// }))



app.delete("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err)
        }else{
            res.redirect(`${reactURL}/login`)
        }
    })
})



const task=require("./routes/task")
const request= require('./routes/request')
const oauth=require('./routes/oauth')
const googlee=require('./routes/google')

app.use("/api/form",task)
app.use("/request",request)
app.use("/oauth",oauth)
app.use("/api",googlee)



app.all('*', (req, res, next) => {
    next(new RouterError(`Can't find ${req.originalUrl} on this server`, 400,"NOT_FOUND"));
});

app.use(errorHandler)


app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});





module.exports=app