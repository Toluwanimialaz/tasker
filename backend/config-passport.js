const collection = require('./config')
const {bcrypt}=require('hash-wasm');
async function getPassword(inputPassword,storedHash,salt){
     const hashed=await bcrypt({
        password:inputPassword,
        salt,
        costFactor: 11,
        outputType: 'encoded',
    })
    return hashed===storedHash
}

const localStrategy=require('passport-local').Strategy

 function initialize(passport,getUserByEmail){
    const authenticateUser= async (username,password,done)=>{
        const user=await getUserByEmail(username) ///could be getUserByUsername too beacause you created the function,it isnt a passport default function
        console.log(user)
        console.log('passport-local is running')
        if(user==null){

            return done(null,false,{message:"No user with that email exists"})
        }
        const salt=new Uint8Array(16);

        const checker=await getPassword(password,user.password,salt)

        console.log(checker)


        try{
            if(checker){
                return done(null,user,{message:"successful"})

            }else{
                return done(null,false,{message:"wrong password"})
            }

        }catch(error){
            return done(error)
        }
    }
    passport.use(new localStrategy({usernameField:'username'},authenticateUser))
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


module.exports=initialize