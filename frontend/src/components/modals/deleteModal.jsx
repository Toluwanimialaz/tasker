import { setDeleteModal,setAlertFlash, setCustomAlertModal} from "../../store/alertSlice/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import { BiX, BiError } from "react-icons/bi";
import { useState, useEffect,useTransition, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { MutateQuery,useFetchQuery,MutateGetQuery} from "@/utils/hooks/queryAPI"
import { update,DELETETASK} from "@/utils/config/urlConfig"
import { formatDateWithOrdinal } from "@/utils/helpers/pureFunctions";
import { useLocation } from "react-router-dom";

export const DeleteTaskModal = () => {
    const [step, setStep] = useState(1);
    const[choice,setChoice]=useState("")
    const[dateArr,setDateArr]=useState([])
    const [flipped, setFlipped] = useState(false);
    const [flipped2, setFlipped2] = useState(false);
    const date=new Date()
    const formatDate=useRef({
      start:"",
      end:""
    })
    const[startEndDate,setStartEndDAte]=useState({
        from:"",
        to:""
    })
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 0
    );
    const dispatch = useDispatch();
    const {mutateAsync:deleteTask,isError:isDeleteError,isPending:isDeletePending,isSuccess:isDeleteSuccess,error:deleteError,reset}= MutateQuery(DELETETASK);
    const { deleteModal: modal } = useSelector((state) => state.alert);

    useEffect(() => {
        const handleResize = () => {
        setWindowWidth(window.innerWidth);
        //   console.log(window.innerWidth)
        };

        window.addEventListener("resize", handleResize);

        // Cleanup on unmount
        return () => window.removeEventListener("resize", handleResize);
    }, [innerWidth]);

    useEffect(()=>{
       console.log(startEndDate)
       const d=new Date(startEndDate.from);
       console.log(formatDateWithOrdinal(d))
       console.log(JSON.parse(modal.payload))
       if(startEndDate){
        if(startEndDate.to || startEndDate.from){
            const isPastTime=new Date(startEndDate.from)
                if(isPastTime.getTime()<new Date().getTime()){
                    dispatch(setAlertFlash({
                        status:true,
                        message:"You cannot select a past date"
                    }))
                    setStartEndDAte((prev)=>{
                        return {
                            ...prev,
                            from:"",
                            to:""
                        }
                    })
                }
           }
       }



    },[startEndDate])

    useEffect(()=>{
      const toggle = () => {
        setFlipped(true);
        setTimeout(() => {
          setFlipped(false);
        }, 600); // match animation duration
      };
      toggle()
    },[startEndDate.from])

    useEffect(()=>{
      const toggle = () => {
        setFlipped2(true);
        setTimeout(() => {
          setFlipped2(false);
        }, 600); // match animation duration
      };
      toggle()
    },[startEndDate.to])

    useEffect(()=>{
      console.log(JSON.parse(modal.payload))
    },[modal])



    const closeModal = () => {
      setStep(1)
       dispatch(setDeleteModal({
        status:false,
        title:"",
        payload:null
       }))
        
    };

    const goBack=()=>{
        setChoice("")
        setStep(1)
    }

    const proceed=(event)=>{
        console.log(event)
        const chosen=event.target.dataset.choice
        if(step===1){
            setChoice(chosen)
            setStep(2)

            return

        }
    }

    const pickCalendarSize = () => {
        if (windowWidth < 431) return "sm";
        if (windowWidth > 430 && windowWidth < 1000) return "icon";
        if (windowWidth > 1000) return "icon";

        return "icon";
    };

    const removeTask=async()=>{
      if(JSON.parse(modal.payload).type==="period"&&(!startEndDate.to||!startEndDate.from)){
        dispatch(setCustomAlertModal({
          title:'Error',
          type:"error",
          status:true,
          message:"You must set a start and end date",
          isChecked:true
        }))
      }
     // Only proceed if startEndDate and its .from exist
      const startDefault = startEndDate?.from && new Date(startEndDate.from).setHours(23);

      // Only proceed if startDefault exists
      const formattedMinute = startDefault && new Date(startDefault).setMinutes(59);

      // Only proceed if formattedMinute exists
      const startISO = formattedMinute && new Date(formattedMinute).toISOString();

      // Now repeat for 'to'
      const endDefault = startEndDate?.to && new Date(startEndDate.to).setHours(23);

      const formattedMinute2 = endDefault && new Date(endDefault).setMinutes(59);

      const endISO = formattedMinute2 && new Date(formattedMinute2).toISOString();

      // const endISO=new Date(startEndDate.to).toISOString()
      const item=JSON.parse(modal.payload)
      const itemToDelete={
        ...item,
        ...(item.type==="period" &&choice=="delete-from-date" &&{deletionStart:startISO}),
        ...(item.type==="period" && choice=="delete-from-date"&&{deletionEnd:endISO}),
      }

        // const response=await axiosAuth.get(update)
        // console.log(response.data)
        try{
            // await new Promise((resolve) => {
            //     setTimeout(() => {
            //       return resolve();
            //     }, 5000);
            //   })
            console.log(item)
              const response=await deleteTask(itemToDelete); 
              console.log(response);  
    
      
            console.log(isDeleteSuccess)
            if(response.data){
                dispatch(
                    setCustomAlertModal({
                    status: true,
                    title: "Delete",
                    isChecked: true,
                    type: "success",
                    message: response.message,
                    })
                );

            }

            setTimeout(()=>{
              location.reload()
            },5000)
        }catch(error){
            console.log("error",error)
            if(error){
                dispatch(setCustomAlertModal({
                    title:'Error',
                    type:"error",
                    status:true,
                    message:error.response.data.error.message,
                    isChecked:true
                }))
            }
        }
        


    }

  return (
    modal.status && (
      <div className="alert-modal" >
        <div className="alert-modal-overlay" onClick={() => closeModal()}></div>
        {((step=== 1 && JSON.parse(modal.payload).type==="oneTime")||(step===2&&choice==="delete-all"))&&(
          <div className="alert-modal-card animate-bounce">
            <div className="close-modal">
              <BiX size={29} onClick={() => closeModal()} />
            </div>
            <div className="alert-image mb-3">
                <BiError size={70} color={"red"} />
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <h4 className="oneTime-title">ARE YOU SURE YOU WANT TO DELETE THIS EVENT</h4>
            </div>
            <div className="oneTime-flex mt-5">
              <Button onClick={closeModal} variant="outline">Cancel</Button>
              <Button onClick={removeTask} variant="destructive">DELETE</Button>
            </div>
        
          </div>
        )}
        {step === 1 && JSON.parse(modal.payload).type==="period"&&(
          <div className="alert-modal-card animate-bounce">
            <div className="close-modal">
              <BiX size={29} onClick={() => closeModal()} />
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <h4>{modal.title}</h4>
            </div>
            <div>
              <div className="alert-modal-body-delete" >
                <div className="delete-message-div" data-choice="delete-all" onClick={(e)=>proceed(e)}>
                  Do you want to delete all past and future events.
                </div>
                <span>OR</span>
                <div className="delete-message-div" data-choice="delete-from-date" onClick={(e)=>proceed(e)}>
                  Do you want to delete your events until a particular date.
                </div>
              </div>
            </div>
          </div>
        )}
        {step===2&&choice==="delete-from-date"&&(
            <div className="verify-modal-card">
                <div className="delete-modal-flex">
                  <IoArrowBackCircleOutline size={35} onClick={()=>goBack()} />
                  {isDeletePending?(
                     <div
                     style={{
                       display: "flex",
                       flexDirection: "row",
                       justifyContent: "center",
                       gap: "10px",
                     }}
                   >
                     <span>Please Wait</span>
                     <div className="ellipsis-loader">
                       <span></span>
                       <span></span>
                       <span></span>
                     </div>
                   </div>
                  ):(
                    <span></span>
                  )}
                  <div></div>

                </div>
                <div  className="calendar-modal-wrapper">
                <h4 className="mt-3">Pick the date you want to start deleting from</h4>
                <div className="StartEndDiv">
                    <div className="StartEndDiv-col">
                        <span style={{fontWeight:"500"}}>Start Date</span>
                        {startEndDate.from?(
                          <div className="flip-container">
                            <div  className={`lid ${flipped ? "animate" : ""}`} >
                              {formatDateWithOrdinal(new Date(startEndDate.from).toISOString()).ordinalDate}{" "}
                              {formatDateWithOrdinal(new Date(startEndDate.from).toISOString()).month}{" "}
                              {formatDateWithOrdinal(new Date(startEndDate.from).toISOString()).year}
                            </div>
                          </div>
                        ):(
                          <span></span>
                        )}
                    </div>
                    <div className="StartEndDiv-col">
                        <span style={{fontWeight:"500"}}>End Date</span>
                        {startEndDate.from?(
                         <div className="flip-container">
                            <div className={`lid ${flipped2 ? "animate" : ""}`}>
                              {formatDateWithOrdinal(new Date(startEndDate.to).toISOString()).ordinalDate}{" "}
                              {formatDateWithOrdinal(new Date(startEndDate.to).toISOString()).month}{" "}
                              {formatDateWithOrdinal(new Date(startEndDate.to).toISOString()).year}
                            </div>
                         </div>
                        ):(
                          <span></span>
                        )}
                    </div>
                </div>
                    <Calendar
                        defaultMonth={date}
                        selected={startEndDate}
                        onSelect={(newRange)=>{
                            setStartEndDAte(newRange??undefined)
                        }}
                        captionLayout="dropdown"
                        className="rounded-lg border shadow-lg"
                        sizer={pickCalendarSize()}
                        mode="range"
                    />
                    <div className="calendar-flex">
                        <div></div>
                        <Button disabled={isDeletePending} size="lg" variant="destructive" onClick={()=>removeTask()}>Delete</Button>
                    </div>
                </div>
            </div>
        )}

      </div>
    )
  );
};
