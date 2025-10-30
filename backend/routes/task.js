const express=require("express")
const {collection} = require("../config")
const initializePassport=require('../config-passport');
const passport=require('passport')
const router=express.Router()
const moment=require('moment')
const {authenticateToken}=require("../middlewares/authenticate/authenticateToken")
const {RouterError,sendSuccess,formatDateBasicUTC,getEarliestDate,getTodayAndNext30Days}=require("../utils/helperFunctions");
const { google } = require("googleapis");
const { datalabeling } = require("googleapis/build/src/apis/datalabeling");



// initializePassport(
//     passport,
//     async(username)=>await collection.findOne({name:username})
// )

const eventFunc=(data)=>{

    const obj={
        calendarId: "primary",      
    }

    const cleaned={
        ...obj,
        ...(data.type==="oneTime"||(data.type==="period"&&!data.deletionStart)&&{eventId:data.calendarEventId}),
        ...(data.type==="period"&&{singleEvents: true,}),
        ...(data.type==="period"&&{orderBy: "startTime"}),
        ...(data.type==="period"&&{timeMin:data.deletionStart}),
        ...(data.type==="period"&&{timeMax:data.deletionEnd}),
    }

    return cleaned
}



router.get("/task",authenticateToken,async (req,res,next)=>{
    const arr=[];
    const ExpiredArr=[]

        
        try{
            const reactURL=process.env.REACT_URL
            const redirectURL =`${reactURL}/home`;
            const oAuth2Client = new google.auth.OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                redirectURL
            );
            const user = await collection.findOne({email:req.user.email})
            oAuth2Client.setCredentials({
                refresh_token: user.calendarRefreshToken,
            });
            const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
            if(user){
                const allTasks=user.tasks;
                for(let i=0;i<allTasks.length;i++){
                    if(allTasks[i].type==="period"){
                        const event=allTasks[i];
                        const earliestDate=getEarliestDate(event.date);
                        const { todayStart, thirtyDaysFromToday } = getTodayAndNext30Days();
                        const itemListObj={
                            ...event,
                            deletionStart:todayStart.toISOString(),
                            deletionEnd:thirtyDaysFromToday.toISOString()
                        }///note that the deletion prefix is just a tag, the purpose of these deletion parameters serve is to list
                        const eventObj=eventFunc(itemListObj);

                        console.log(`${i} earliest Date=`,getEarliestDate(event.date));
                        console.log(`${i} eventOBJ=`,eventObj);
                        const response = await calendar.events.list(eventObj);
                        const events = response.data.items;   
                        if (!events || events.length === 0) {
                            console.log('No events found in time frame');
                            arr.push(allTasks[i])
                            continue
                        }
                        let filteredArray=[]

                        for(const loopEvent of events){
                            if(event.calendarEventId===loopEvent.recurringEventId){
                                filteredArray.push(loopEvent.start.dateTime)
                            }
                        }
        
                        console.log("filtered ARR=",filteredArray)
                        const earliest=getEarliestDate(filteredArray)
                        console.log(`${i}. earliest date=`,earliest)

                        
                        await collection.updateOne(
                            { email:req.user.email, "tasks.date":allTasks[i].date },
                            { $set: { "tasks.$.nextDate": earliest  } }
                        )
                        

                        arr.push(allTasks[i])

                        continue
                    }
                    console.log("FOR LOOP START")
                    const isoTask=allTasks[i].date
                    const taskDate=moment(isoTask)
                    console.log("task date=",taskDate)
                    const dateNow=moment()
                    console.log("datenow=",dateNow)
                    console.log(dateNow)
                    if(taskDate.isBefore(dateNow)&&allTasks[i].type!=="period"){
                        await collection.updateOne(
                            { email: req.user.email },
                            { $pull: { tasks: allTasks[i]} }
                        );
                        ExpiredArr.push(allTasks[i])

                    }else{
                        arr.push(allTasks[i])

                    }

                }
                return sendSuccess(res,{current:arr,expired:ExpiredArr},`task array successfully fetched`,200)
            }else{
                new RouterError("invalid credentials", 401, "INVALID_CREDENTIALS")
            }
            // await user.save()
        }catch(error){
            console.log(error)
            next(error)
        }

        // return sendSuccess(res,{status:"",current:arr,expired:ExpiredArr},`task array successfully fetched`,201)
    
        // res.json({status:"",current:arr,expired:ExpiredArr})
    
})

router.post('/task',authenticateToken,async(req,res,next)=>{
   try{
        const delTask= req.body.delTask;
        console.log(`deltask=${delTask}`);
        const user=await collection.findOne({email:req.user.email});
        if(user){
            const findTask=user.tasks.find(t=>t.task===delTask)
            if(findTask){
                await user.updateOne(
                    { email: user.email },
                    { $pull: { tasks: findTask} }
                );

                return sendSuccess(res,{tasks:arr},`${delTask}successfully deleted`,200)
            }else{
                new RouterError("invalid credentials", 401, "INVALID_CREDENTIALS")
            }
            // const arr = user.tasks.map(task => task.task)
            // user.tasks = user.tasks.filter(task => task.task !== delTask);
            // const updatedArr = arr.filter(task => task !== delTask);
            // user.tasks.map((task,index)=>{
            //     console.log(`${index}.${task.task}`)
            //     arr.push(task.task)
            //     if(task.task===delTask){
            //        user.tasks.splice(index,1)
            //         arr.splice(index,1)
            //     }
            // })
            // console.log(`user.tasks=${user.tasks}`)
            // console.log(`arr=${arr}`)
            
            
            
        }else{
            new RouterError("invalid credentials", 401, "INVALID_CREDENTIALS")
        }
    }catch(err){
        console.log(err)
        next(err)

   }
//    res.json({myArray:arr})
})

router.post("/delete",authenticateToken,async(req,res,next)=>{
    try{
        const itemToDelete=req.body;
        console.log("ITEM TO DEL=",itemToDelete)
        const user=await collection.findOne({email:req.user.email});
        if(user){
            const reactURL=process.env.REACT_URL
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
            const presentDate=formatDateBasicUTC()
            const eventObject=eventFunc(itemToDelete)
            console.log("eventobject",eventObject)

            // const events=user.tasks;
            if(itemToDelete.type==="period"&&itemToDelete.deletionStart&&itemToDelete.deletionEnd){     
                const response = await calendar.events.list(eventObject);
                
                const events = response.data.items;   
                if (!events || events.length === 0) {
                    console.log('No events found');
                    return sendSuccess(res,[],`There were no events to delete within your time frame`,200)
                }

                let filteredArray=[]

                for(const event of events){
                    if(event.recurringEventId===req.body.calendarEventId){
                        filteredArray.push(event)
                    }

                }

                console.log(filteredArray)

                for (const event of filteredArray) {
                    await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: event.id,
                    });
                    console.log(`Deleted event: ${event.summary || '(no title)'}`);
                }

                return sendSuccess(res,filteredArray,`successfully deleted`,200)

            }else{
                await calendar.events.delete(eventObject);
                
                await collection.updateOne(
                    {email:req.user.email},
                    { $pull: { tasks: itemToDelete } }
                ) 

                return sendSuccess(res,itemToDelete,`successfully deleted`,200)
            }
        }else{
            return new RouterError("invalid credentials", 401, "INVALID_CREDENTIALS")
        }


        // await calendar.events.patch(eventObject);

        // await collection.updateOne(
        //     {email:req.user.email},
        //     { $pull: { tasks: itemToDelete } }
        // )  


        

        

    }catch(error){
        console.log(error)
        return next(error)


    }



})













module.exports=router