import { setCustomAlertModal,setDescriptionModal } from "../../store/alertSlice/alertSlice"
import { useDispatch,useSelector } from "react-redux"
import { BiX,BiError } from "react-icons/bi"
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MutateQuery } from "@/utils/hooks/queryAPI";
import { ADDTASK } from "@/utils/config/urlConfig";
import { useQueryClient,useMutation } from "@tanstack/react-query";
import { AlertModal } from "./AlertModal";




export const DescriptionModal=()=>{
    const navigate = useNavigate();
    const {mutateAsync:addTask,isError,isPending,isSuccess,error,reset}= MutateQuery(ADDTASK)
    const dispatch=useDispatch()
    const queryClient=useQueryClient()
    const {descriptionModal:modal} = useSelector((state) => state.alert);
    const [validFields,setValidFields]=useState(true)
    const[description,setDescrition]=useState('')
    const closeModal=()=>{
        if(isPending){
            return
        }
        dispatch(setDescriptionModal({
            status:false,
            title:"",

        }))
    }

    useEffect(()=>{
        if(modal?.message?.includes('registration successful, please check your email')){
           const timeout =setTimeout(()=>{
            closeModal()
           },5000)

           return () => clearTimeout(timeout)
        }

        console.log("FROM desc",modal?.payload)
        setDescrition('')



    },[modal])

    useEffect(()=>{
        if(isSuccess){
            dispatch(setCustomAlertModal({
                status:true,
                isChecked:true,
                message:"task successfully added"
            }))
            reset()
          
            closeModal()
            
            


        }
    },[isSuccess])

    useEffect(()=>{
        checkValidity()
    },[description])

    const checkValidity=()=>{
        if(description.length<=5){
            setValidFields(true)
            return
        }

        setValidFields(false)
        return
    }


    const updateDescription=(event)=>{
        console.log(event)
        const val=event.target.value;
        setDescrition(val)

    }

    const submitTask=async()=>{
        const payloadParams={
            ...modal?.payload,
            ...{description:description}
        }
        try{
            console.log("ispending",isPending)
            console.log("iserror",isError)
            console.log("error",error)
            console.log("issuccess",isSuccess)
            const res=await addTask(payloadParams,"task")
            console.log(res)
            
            

        }catch(Error){
            console.log(error)
            if(Error){
                dispatch(setCustomAlertModal({
                    title:'Error',
                    type:"error",
                    status:true,
                    message:Error.response.data.error.message,
                    isChecked:true
                }))
            }
        }
    }



    return(
        modal.status&&(
            <div className='alert-modal'style={{zIndex:"121"}}>
                <div className='alert-modal-overlay' onClick={()=>closeModal()}></div>
                <div className='alert-modal-card animate-bounce'>
                    <div className='close-modal'>
                        <BiX size={29} onClick={() => closeModal()} />
                    </div>
                    <div className='alert-modal-body'>
                        <div className='text-center w-100' style={{textAlign:"center"}}>
                            <h4 className="pb-3">{modal.title}</h4>
                            <p className={`task-added ${isSuccess?"appear":"disappear"}`} style={{fontWeight:"600",color:"green",fontSize:"20px"}}>TASK ADDED</p>
                            <textarea className="description-field" onChange={(event)=>updateDescription(event)}/>
                        </div>
                        <div className="w-100% flex justify-right">
                            <button className="site_button" disabled={validFields===true || isPending===true?true:false} onClick={submitTask}>Complete</button>
                        </div>
                        
                    </div>
                </div>

            </div>
        )
    )
}