if(process.env.NODE_ENV!=="production"){
    console.log("ready to go in testing")
    require('dotenv').config()
}


const reactURL=process.env.REACT_URL
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

const bodyParser=require('body-parser')
const express= require('express');
const pathh=require('path')
const collection=require('./config')
const app=express();
app.set('trust proxy', 1);
const port=process.env.PORT || 3000;
const initializePassport=require('./config-passport');
const passport=require('passport');
const flash=require('express-flash')
const session=require('express-session')
const methodOverride=require('method-override')
const mongoStore=require('connect-mongo');

const {bcrypt,bcryptVerify}=require('hash-wasm');
const { Collection } = require('mongoose');


initializePassport(
    passport,
    async(username)=>await collection.findOne({name:username})
)
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.set('views', pathh.join(__dirname, 'views'));
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    store: mongoStore.create({ mongoUrl:process.env.MONGODB_URI}),
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie: {
       maxAge:1000*60*60*60,
       secure: process.env.NODE_ENV === 'production'?true:false,
       sameSite:'None',
       httpOnly:process.env.NODE_ENV === 'production'?true:false,

    }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))




app.use((req, res, next) => {
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', req.headers);
    next();
});

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log('Responseess Headers:', res.getHeaders());
    });
    next();
});
  
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('User:', req.user);
    next();
});






function auhenticated(req,res,next){
    if(req.isAuthenticated()){
        console.log("User authenticated:", req.user);
        next()
    }else{
        return res.redirect(`${reactURL}/login`)
    }
}

function notAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect(process.env.REACT_URL);
    }else{
        next()
    }
}

app.get("/",(req,res)=>{
    res.status(200).json({"working":"successs"})
})

app.get("/api",(req,res)=>{
    if(req.isAuthenticated()){
        res.json({names:req.user.name,status:""})
    }else{
        res.auth="false";
        const truth=res.auth;
        console.log(truth)
        res.json({names:"",status:truth})
    }
})


app.post("/api/form",async(req,res)=>{
    const date=req.body.date
    console.log(date)
    try{
        const user=await collection.findOne({name:req.user.name})
        if(user){
            const tasker={
                task:req.body.task,
                date:req.body.date,
            }
            user.tasks.push(tasker)
            await user.save()
            console.log(user._id)

        }else{
           console.log("an error occured")
        }
    }catch(error){
        console.log(error)
    }
    res.json({message:"received successfully"})

})


app.get("/homeee",auhenticated,(req,res)=>{
    res.render("home",{name:req.user.name})
})

app.get("/login",notAuthenticated,(req,res)=>{
    res.render("login",{errorMessage:""})
})

app.get("/signup",notAuthenticated,(req,res)=>{
    res.render("signup")
})

app.post("/signup",notAuthenticated,async(req,res)=>{
    const user={
        name:req.body.username,
        password:req.body.password,
        tasks:[]
    }

    const finduser=await collection.findOne({name:user.name})
    if(finduser){
        res.send("username is taken,try another one")  
    }else{
        const salt=new Uint8Array(16);;
        const key = await bcrypt({
            password: user.password,
            salt, // salt is a buffer containing 16 random bytes
            costFactor: 11,
            outputType: 'encoded', // return standard encoded string containing parameters needed to verify the key
        });
        console.log(`hashedpassword: ${key}`)
        user.password=key
        console.log(user.password)
        const userData=await collection.insertMany(user)
        console.log(userData)
        res.redirect(`${reactURL}/login`)
    }
})




app.post("/login",notAuthenticated,passport.authenticate('local',{
    successRedirect:`${reactURL}/home` ,
    failureRedirect:`${reactURL}`,
    failureFlash:true
}))

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
const google=require('./routes/google')

app.use("/api/form",task)
app.use("/request",request)
app.use("/oauth",oauth)
app.use("/api",google)


app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});





module.exports=app