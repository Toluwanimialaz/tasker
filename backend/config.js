const mongoose=require("mongoose");
const { required } = require("nodemon/lib/config");
const connection=async()=>{
    try{
        mongoose.connection.on("connected",()=>{
            console.log("connection successful")
        })
        await mongoose.connect(process.env.MONGODB_URI)
    }catch(error){
        console.log(error)
    }
}

connection()

const now=new Date()
console.log(now)

const loginSchema= new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    provider:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        default:null
    },
    tasks:{
        type:Array,
        default:[]
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    displayPicture:{
        type:String,
        default:null

    },
    calendarToken:{
        type:String,
        default:null
    },
    calendarRefreshToken:{
        type:String,
        default:null
    },
    isGoogleRefreshToken:{
        type:Boolean,
        default:false
    }
})

const verificationSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    verificationCode:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:600
    }
})

const refreshTokenSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    refreshToken:{
        id:{
            type:String,
            default:"",
            required:true
        },
        expiresAt:{
            type:Date,
            index: { expires: 0 },
            required:true
        },
    }

})

const collection=mongoose.models.user|| mongoose.model("user",loginSchema);
const verifyCollection=mongoose.models.codes|| mongoose.model("codes",verificationSchema); ///was formally new mongoose model
const tokenCollection=mongoose.models.tokens|| mongoose.model("tokens",refreshTokenSchema);

module.exports={
    collection,
    verifyCollection,
    tokenCollection
}





