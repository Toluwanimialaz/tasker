const mongoose=require("mongoose");
const { required } = require("nodemon/lib/config");
const connection=mongoose.connect(process.env.MONGO_URL)

connection.then(()=>{
    console.log("google connection successful")
})
.catch((error)=>{
    console.log(error)
})

const loginSchema= new mongoose.Schema({
    googleData:{
        type:Object,
        required:true
    },
    tasks:{
        type:Array,
        required:true
    }
})

const collectionGoogle=new mongoose.model("userr",loginSchema);

module.exports=collectionGoogle





