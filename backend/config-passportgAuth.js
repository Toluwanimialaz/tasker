const googleStrategy=require('passport-google-oauth20').Strategy
require('dotenv').config()

const collection=require('./config')

function shortener(word){
    const words=word.split("")
    let index;
    const arr=[];
    words.map((ele,ind)=>{
      if(ele===" "){
        index=ind;
      }
      arr.push(ele)

    })
    console.log(index)
    const bad=arr.slice(0,index)
    console.log(bad)

    const wow=bad.join("")

    return wow

}

function processor(passport,getUser){
    const authenticate=async (accessToken,refreshToken,profile,done)=>{
        const shortWord=shortener(profile.displayName)
        console.log(`shortWord= ${shortWord}`)
        const googleUser={name:shortWord,password:profile._json.sub,tasks:[]}
        const user=getUser(profile)
        const data= await user
        console.log('passport-google is running')
        console.log(profile)
        try{
            if(data){
                console.log('user exists')
                console.log(`data=${data}`)
                return done(null,data)
            }else{
                await collection.insertMany(googleUser)
                const newUser=await collection.findOne({name:shortWord})
                console.log('user doesnt exist')
                console.log(newUser)
                console.log(`data=${data}`)
                return done(null,newUser)
                
            }
        }catch(error){
            return done(error)
        }
    }
    passport.use(new googleStrategy(
        {
            clientID:process.env.CLIENT_ID,
            clientSecret:process.env.CLIENT_SECRET,
            callbackURL:'https://task-backend-7r94.onrender.com/api/auth/google/callback'
        },authenticate
    ))
    passport.serializeUser((user,done)=>done(null,user.id))
    passport.deserializeUser(async(id,done)=>{
        try{
            const userr=await collection.findById(id)
            return done(null,userr)
            
        }catch(err){
            done(err)
        }
    })

    
    

}

module.exports=processor