const fs=require('fs').promises;
const path=require('path');

const limiter=(filePath)=>{
    return async(req,res,next)=>{
        try{
            const fullPath = path.resolve(filePath);

            let jsonData={}

            try{
                const fileContent=await fs.readFile(fullPath,'utf8');
                jsonData=JSON.parse(fileContent);

            }
            catch(error){
                console.log('Creating new JSON file or file was invalid');
            }
            let updateData = {
                firstTry: new Date().toISOString(),
                ip:(req.headers['x-forwarded-for']||"").split(",")[0]!==""?(req.headers['x-forwarded-for']||'').split(",")[0]:req.ip,
                // method: req.method,
                // path: req.path,
                // tries:jsonData.tries?jsonData.tries+=1:1
            }
            const condition1=jsonData.method===req.method && jsonData.url===req.originalUrl?true:false
            const condition2=jsonData.url!==req.originalUrl||!jsonData.url?true:false

            updateData={
                ...updateData,
                ...(condition2&&{method:req.method}),
                ...(condition2&&{url:req.url}),
                ...(condition2&&{tries:1}),
                ...(condition1&&{method:jsonData.method}),
                ...(condition1&&{url:jsonData.url}),
                ...(condition1&&{tries:jsonData.tries+=1}),
            }

            const updatedJson=updateData;
            await fs.writeFile(
                fullPath,
                JSON.stringify(updatedJson, null, 2), // Pretty print with 2 spaces
                'utf8'
            );
            res.locals.updatedJson = updatedJson;
            next()

        }
        catch(error){
            console.error('Error updating JSON file:', error);
            next(error); // Pass error to error handling middleware
        }

    }
    // const ip=(req.headers['x-forwarded-for']||"").split(",")[0]!==""?(req.headers['x-forwarded-for']||'').split(",")[0]:req.ip;

    // const response=res.json
    // res.json=function(data){
    //     const responseData=typeof data==="object"&& data!==null
    //     ?{...data,ipAddress:res.locals.Myip}
    //     :{data,ipAddress:res.local.Myip}
       
    //     return response.call(this,responseData)
    // }  

    // THIS IS SOME USEFUL CODE TO TAKE NOTE OF

    // next()
}







module.exports={
    limiter
}