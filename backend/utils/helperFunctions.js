const nodemailer = require('nodemailer');
const accessSecret=process.env.ACCESS_TOKEN_SECRET
const reactURL=process.env.REACT_URL

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

const checkOTP=async(email,OTP,collection,verifyCollection)=>{
    try{
        console.log("Checking token for:", email);
        const findUnverifiedUser=await collection.findOne({email:email,isVerified:false})
        const doesTokenExist=await verifyCollection.findOne({email:email})
        console.log("Does token exist?", doesTokenExist);
        if(!findUnverifiedUser){
            return {error:{code:"invalid request",message:`${email} is already verified or isn't a user`}}
        }
        console.log("SECOND BLOCK TRIGGERED")
        if(doesTokenExist){
            console.log("YOU ALREADY HAVE A VALID TOKEN")
            return {error:{code:"invalid request",message:`${email} already has a valid token`}}
        }else{
            await sendWelcomeEmail(email, findUnverifiedUser.name,OTP);
            const tokenUser=await verifyCollection.insertMany({email:email,verificationCode:OTP})
            console.log("tokenuser",tokenUser)
            return {status:"email sent"}
        }

    }catch(error){
        console.log(error)
    }
}

const generateToken=(jwt,user)=>{
    const access_token= jwt.sign(user,accessSecret,{expiresIn:'2m'})
    const now=new Date()
    const access_expiry=new Date(now.getTime()+5*60*1000).toISOString()
    return{accessToken:access_token,accessExpiry:access_expiry}
}

// utils/response.js
const sendSuccess = (res, data = {}, message = "Success", status = 200) => {
    return res.status(status).json({
        success: true,
        data,
        message,
    });
};
  
class RouterError extends Error{
    constructor(message,statusCode,code){
        super(message);
        this.statusCode=statusCode;
        this.code=code;
        this.status=`${statusCode}`.startsWith('4')?"fail":"error"
        this.isOperational=true
    }
}

async function retry(func,...args) {
    let attempt = 0;
    const maxAttempts=3;
    while (attempt < maxAttempts) {
      try {
        const response=await func(...args);
        return response
      } catch (err) {
        console.log(err)
        attempt++;
        if (attempt === maxAttempts){
            return false
        } 
        await new Promise((r) => setTimeout(r, 500)); 
      }
    }
}

function createCalendarEvent(title, startISO, durationMinutes,periodType,freq,interval,daysWeeksRepeated,timeZone = "UTC") {
    console.log("periodType",periodType);
    console.log("freq",freq)
    console.log(typeof(startISO))
    console.log(typeof(startISO)==="string")
    let start;
    if(typeof(startISO)==="string"){
        start = new Date(startISO);
    }else{
        const earliestDate = startISO.reduce((min, curr) => {
            return Date.parse(curr) < Date.parse(min) ? curr : min
        });
        start=new Date(earliestDate)

    }

    const monthDate=new Date(start)
    const month=monthDate.getMonth() + 1



    const monthDateString=typeof(startISO)==="string"?null:
    startISO.map((ele)=>{
        const date = new Date(ele);
        const day = date.getDate();
        return day
    }).join(",")

   

    console.log("Starting Date=",start)
    console.log("monthDateString=",monthDateString)
    console.log("monthDAte=",month)
    
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const frequency=freq==="daily"?"DAILY":freq==="weekly"?"WEEKLY":freq==="fortnightly"?"WEEKLY":freq==="monthly"?"MONTHLY":"YEARLY"
    const stuff=["RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU"]
  
    const event= {
      summary: title,
      start: {
        dateTime: start.toISOString(),
        timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone,
      },
    };

    const determineTypeEvent={
        ...event,
        ...(periodType==="period" && {recurrence:[`RRULE:FREQ=${frequency}${freq==="fortnightly"?`;INTERVAL=${(2*Number(interval)).toString()}`:`;INTERVAL=${interval}`}${daysWeeksRepeated.length>0?`;BYDAY=${daysWeeksRepeated}`:""}${(freq==="monthly"||freq==="yearly")?`;BYMONTHDAY=${monthDateString}`:""}${freq==="yearly"?`;BYMONTH=${month}`:""}`]})
    }

    console.log("RRULE=",determineTypeEvent) 

    return determineTypeEvent
}

function formatDateBasicUTC(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
  
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
}

function beforeSymbol(str, symbol) {
    const index = str.indexOf(symbol);
    return index === -1 ? str : str.substring(0, index);
}

function getEarliestDate(isoDates) {
    if(typeof(isoDates)==="string") return isoDates
    if (!isoDates?.length) return null;
    return isoDates.reduce((a, b) => (a < b ? a : b));
}

function getTodayAndNext30Days() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // start of today
  
    const thirtyDaysFromToday = new Date(todayStart);
    thirtyDaysFromToday.setDate(todayStart.getDate() + 30); // add 30 days
    console.log("today and 30days away=",todayStart.toISOString(), thirtyDaysFromToday.toISOString())
  
    return { todayStart, thirtyDaysFromToday };
  }
  
  
  
  



module.exports={
    sendWelcomeEmail,
    generateToken,
    checkOTP,
    retry,
    sendSuccess,
    RouterError,
    createCalendarEvent,
    formatDateBasicUTC,
    beforeSymbol,
    getEarliestDate,
    getTodayAndNext30Days
}