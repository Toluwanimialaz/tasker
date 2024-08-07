const mongoose=require("mongoose");
const { required } = require("nodemon/lib/config");
const connection=mongoose.connect(process.env.MONGO_URL)

connection.then(()=>{
    console.log("connection successful")
})
.catch((error)=>{
    console.log(error)
})

const loginSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    tasks:{
        type:Array,
        required:true
    }
})

const collection=new mongoose.model("user",loginSchema);

module.exports=collection





