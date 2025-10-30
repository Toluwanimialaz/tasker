import { setAlertFlash } from "../../store/alertSlice/alertSlice"
import { useDispatch,useSelector } from "react-redux"
import { BiX,BiError } from "react-icons/bi"
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useEffect } from "react";



export const AlertFlash=()=>{
    const dispatch=useDispatch()
    const {alertFlash:modal} = useSelector((state) => state.alert);
    const closeModal=()=>{
        dispatch(setAlertFlash({
            status:false,
            message:"",
            type:"",
        }))
    }

    useEffect(()=>{
        if(modal.status){
            setTimeout(()=>{
                closeModal()
            },2000)
        }
    },[modal])

    return(
        modal.status&&(
            <div className="flex_row" style={{width:"100%"}}>
                <div className={`flashModal ${modal.type==="success"?"success":modal.type==="error"?"error":"error"}`}>
                    {modal.message}
                </div>
            </div>
        )
    )
}