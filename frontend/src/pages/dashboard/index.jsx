import  Taskscroller from "@/components/Taskscroller"
import { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { getTasks } from "@/store/taskSlice/actions";
import { setDeleteModal } from "@/store/alertSlice/alertSlice";

export default function Dashboard() {
    const [tasks,setTasks]=useState(["sasdad"])
    const {currentTasks,expiredTasks}=useSelector((state)=>state.task)
    

    const dispatch=useDispatch()



    useEffect(()=>{
        dispatch(getTasks())
    },[dispatch])
    



    return(
        <div className="dashboard">
            <Taskscroller current={currentTasks} expired={expiredTasks}/>
        </div>
    )
}