import { setCustomAlertModal } from "../../store/alertSlice/alertSlice"
import { useDispatch,useSelector } from "react-redux"
import { BiX,BiError } from "react-icons/bi"
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";



export const AlertModal=()=>{
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch=useDispatch()
    const {CustomAlertModal:modal} = useSelector((state) => state.alert);
    const closeModal=()=>{
        dispatch(setCustomAlertModal({
            status:false,
            title:""
        }))

        if(modal.message?.includes('registration successful, please check your email')){
            
            setTimeout(()=>{
                navigate("/verify");
            },1000)
        }

        if(modal.title==="Task delete successful"){
            console.log("frte")
            setTimeout(()=>{
                navigate(0)
            },1000) 
        }
    }

    useEffect(()=>{
        if(modal?.message?.includes('registration successful, please check your email')){
           const timeout =setTimeout(()=>{
            closeModal()
           },5000)

           return () => clearTimeout(timeout)
        }



    },[modal])



    return(
        modal.status&&(
            <div className='alert-modal'style={{zIndex:"121212000"}}>
                <div className='alert-modal-overlay' onClick={()=>closeModal()}></div>
                <div className='alert-modal-card animate-bounce'>
                    <div className='close-modal'>
                        <BiX size={29} onClick={() => closeModal()} />
                    </div>
                    <div className='alert-modal-body'>
                        <div className='text-center w-100' style={{textAlign:"center"}}>
                            <div className="alert-image">
                                {modal.isChecked?(
                                    <div>
                                        {modal?.type === "error" ? (
                                            <BiError size={70} color={"red"} />
                                            ) : (
                                            <div className="checksuccess">
                                                <AiOutlineCheckCircle size={50} color={"#0d0080"} />
                                            </div>
                                        )}
                                    </div>
                                ):(
                                    <div>
                                        
                                    </div>
                                )}
                            </div>
                            <h4 className="pb-3">{modal.title}</h4>
                            <div className="alert-message"><p>{modal.message}</p></div>
                        </div>
                        
                    </div>
                </div>

            </div>
        )
    )
}