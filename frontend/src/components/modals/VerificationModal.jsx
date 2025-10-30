import { setCustomAlertModal,setVerificationModal,setAlertFlash } from "../../store/alertSlice/alertSlice"
import { useDispatch,useSelector } from "react-redux"
import { BiX,BiError } from "react-icons/bi"
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useRef,useEffect,useState,useCallback } from "react";
import { axiosAuth } from "../../utils/config/axios";
import { REQUEST,VERIFY } from "../../utils/config/urlConfig";
import { useLocation, useNavigate } from "react-router-dom";


export const VerificationModal=()=>{
    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs=useRef([]);
    const dispatch=useDispatch()
    const {verificationModal:modal,CustomAlertModal} = useSelector((state) => state.alert);
    const {user}=useSelector((state)=>state.auth)
    const params = new URLSearchParams(location.search);
    const emailParam=params.get("email");
    const [inputCode,setInputCode]=useState(null)
    const [count, setCount] = useState(15);
    const timerRef=useRef(null);
    const [time,setTime]=useState("1:00");
    const [loading,setLoading]=useState(false);

    
    // useEffect(()=>{
    //     timerRef.current=setTimeout(()=>{
    //         handletimer()
    //     },1000)

    //     return()=>{
    //         clearInterval(timerRef.current)
    //     }
    // },[count])

    useEffect(()=>{
        startTimer()
    },[])

    useEffect(()=>{
        
        const submitCode=async()=>{
            if(loading){
                return
            }

            if(!inputCode){
                return
            }
          
            try{
                setLoading(true)
                let payload={
                    Otp:inputCode,
                    email:emailParam?emailParam:user.email,
                }
                const response=await axiosAuth.post(VERIFY,payload)
                const responseData=response.data;
                console.log(responseData)
                if(responseData.success){
                    dispatch(setCustomAlertModal({
                        status:true,
                        message:responseData.message,
                        isChecked:true,
                        type:"success"
                    }))
                }
                inputRefs.current.forEach((item)=>{
                    item.value=''
                })
                closeModal()

            }catch(error){
                dispatch(setCustomAlertModal({
                    status:true,
                    isChecked:true,
                    title:"Error",
                    type:"error",
                    message:error?.response?.data?.error?.message||"Something went wrong"
                }))
                inputRefs.current.forEach((item)=>{
                    item.value=''
                })
            }finally{
                setLoading(false)
            }
        }

        submitCode()
    },[inputCode])


    const handletimer=()=>{
        
        setCount((prev)=>{
            const number=prev-1
            if (number < 0) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setCount(15)
                setTime("1:00")
                return 0;
            }
            // setTime(number.toString())
            // setTime((prev)=>{
            //     console.log(prev)
            //     console.log(prev[2])
            //     if(number<10){
            //         return '0:0'+number.toString()
            //     }else{
            //         return "0:"+number.toString()
            //     }
            // })
            setTime(number < 10 ? `0:0${number}` : `0:${number}`);
            return prev-1
        })

    }

    const startTimer=()=>{
        if(!timerRef.current){
            timerRef.current=setInterval(()=>{
                handletimer()
            },1000)
        }
    }

    const endTimer=()=>{
        clearInterval(timerRef.current)
    }

    const handleRequest=async()=>{
        if(loading){
            return
        }
        if(timerRef.current && count!==0){
          dispatch(setAlertFlash({
            status:true,
            message:"You Likely still have a valid OTP",
            type:"error"
          })) 
          return 
        }
        try{
            setLoading(true)
            const payload={
                email:emailParam?emailParam:user.email,
                // email:emailParam?emailParam:user.email,
            }
            const response=await axiosAuth.post(REQUEST,payload)
            const responseData=response.data;
            console.log(responseData)
            if(responseData.success){
                setLoading(false);
                startTimer()
            }
        }catch(error){
            console.log(error)
            dispatch(setCustomAlertModal({
                status:true,
                message:error.response.data.error.message,
                title:"Error",
                isChecked:true,
                type:"error"
            }))

        }finally{
            setLoading(false)
        }       
    }
 



    const handleInputChange=async(e,index)=>{
        const rej=/^\d+$/;

        const value=e.target.value;
        if(rej.test(value)){
            if(value&& index<inputRefs.current.length-1){
                inputRefs.current[index+1].focus();
            }
        }else{
            e.target.value=""
        }

        if(index===inputRefs.current.length-1){
            const code= inputRefs.current.map((item,index)=>{
                return item.value
            }).join("")
            if(code.length===6){
                setInputCode(code)
            }
        }
        
   

    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
          inputRefs.current[index - 1].focus();
        }
    };

    const closeModal = () => {
        navigate("/");

    };

    return(
        <>
            <div className='alert-modal'>
                <div className='alert-modal-overlay' onClick={()=>closeModal()}></div>
                <div className='alert-modal-card animate-bounce'>
                    <div className='close-modal'>
                        <BiX size={29} onClick={() => closeModal()} />
                    </div>
                    <div className='alert-modal-body'>
                        <div className='text-center w-100' style={{textAlign:"center"}}>
                            <div className="verify-timer-div">
                                <span></span>
                                <h4 className="pb-3">{modal.title}</h4>
                                <span className="timer-div">{time}</span>
                            </div>
                            {loading&&
                                <div className="please-wait"style={{display:"flex",flexDirection:"row",justifyContent:"center",gap:"10px"}}>
                                    <span>
                                    Please Wait
                                    </span>
                                    <div className="ellipsis-loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    </div>
                                </div>
                            }
                            <div className="Verification_Div">
                                {Array.from({length:6})?.map((item,index)=>(
                                    
                                    <input
                                    ref={(el)=>inputRefs.current[index]=el}
                                    onChange={(e)=>handleInputChange(e,index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    type="text"
                                    maxLength="1"
                                    key={index}
                                    />
                                    
                                ))}
                            </div>
                            <p>If your code expires,you can request another one <span style={{color:"blue",textDecoration:"underline",cursor:"pointer"}}
                             onClick={()=>{handleRequest()}}>here</span></p>

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}