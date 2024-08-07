if(process.env.NODE_ENV!=="production"){
    console.log("ready to go in testing")
    require('dotenv').config()
}


const bodyParser=require('body-parser')
const express= require('express');
const pathh=require('path')
const collection=require('./config')
const app=express();
const port=3050;
const initializePassport=require('./config-passport');
const passport=require('passport');
const flash=require('express-flash')
const session=require('express-session')
const methodOverride=require('method-override')
const moment=require('moment')
const mongoStore=require('connect-mongo');

const {bcrypt,bcryptVerify}=require('hash-wasm');
const { Collection } = require('mongoose');



app.set("view engine","ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    store: mongoStore.create({ mongoUrl:process.env.MONGO_URL}),
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60},
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(bodyParser.json())


initializePassport(
    passport,
    async(username)=>await collection.findOne({name:username})
)

app.get("/api",(req,res)=>{
    if(req.isAuthenticated()){
        res.json({names:req.user.name})
    }else{
        res.auth="false";
        const truth=res.auth;
        console.log(truth)
        res.json({status:truth})
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
        res.redirect("/login")
    }
})

function auhenticated(req,res,next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/login')
    }
}

function notAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect(process.env.REACT_URL);
    }else{
        next()
    }
}


app.post("/login",notAuthenticated,passport.authenticate('local',{
    successRedirect:`${process.env.REACT_URL}/home`,
    failureRedirect:"/login",
    failureFlash:true
}))

app.delete("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err)
        }else{
            res.redirect('/login')
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



app.listen(port,()=>{
    console.log(`app listening on port ${port}`)
})