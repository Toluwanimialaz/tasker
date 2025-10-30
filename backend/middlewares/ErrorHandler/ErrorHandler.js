const errorHandler=(err,req,res,next)=>{
    let statusCode=err.statusCode||500;
    let message=err.message||"Something went wrong";
    let code=err.code||"REQUEST_FAILED";
    let status=err.status||"Error";

    

    if (!err.isOperational) {
        console.error('Unexpected Error', err);
        message = 'Something went wrong.';
    }

    res.status(statusCode).json({
        success:false,
        error:{
            message:message,
            code:code,
            status:status,
            ...(process.env.NODE_ENV === 'testing' && { stack: err.stack })
        }      
    })
}


module.exports={errorHandler}