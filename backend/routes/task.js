const express=require("express")
const collection = require("../config")
const initializePassport=require('../config-passport');
const passport=require('passport')
const router=express.Router()
const moment=require('moment')



initializePassport(
    passport,
    async(username)=>await collection.findOne({name:username})
)


router.get("/task",async (req,res)=>{
    const arr=[];
    const ExpiredArr=[]
    if(req.isAuthenticated()){
        const user = await collection.findOne({name:req.user.name})
        try{
            if(user){
                user.tasks.forEach((element,index) => {
                    const date1=moment(element.date)
                    const dateNow=moment().toISOString()
                    if(date1.isBefore(dateNow)){
                        ExpiredArr.push(element)
                        user.tasks.splice(index,1)
                    }else{
                        arr.push(element)
                    }
                });
            }else{
                console.log("error")
            }
            await user.save()
        }catch(error){
            console.log(error)
        }
    
        res.json({current:arr,expired:ExpiredArr})
    }else{
        res.auth="false";
        const truth=res.auth;
        console.log(truth)
        res.json({status:truth})
    }
    
})

router.post('/task',async(req,res)=>{
    const arr=[]
   try{
        const delTask= req.body.delTask
        console.log(`deltask=${delTask}`)
        const user=await collection.findOne({name:req.user.name});
        if(user){
            user.tasks.map((task,index)=>{
                console.log(`${index}.${task.task}`)
                arr.push(task.task)
                if(task.task===delTask){
                   user.tasks.splice(index,1)
                    arr.splice(index,1)
                }
                
            })
            console.log(`user.tasks=${user.tasks}`)
            console.log(`arr=${arr}`)
            await user.save()
            
            
        }
    }catch(err){
        console.log(err)
   }
   res.json({myArray:arr})
})













module.exports=router