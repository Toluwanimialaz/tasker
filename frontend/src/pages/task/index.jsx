import React,{useState,useEffect,useRef} from 'react'
import axios from 'axios'
import "./style.css"
import moment from 'moment'
import { isAfter } from 'date-fns'


function navigate(url){
    window.location.href=url;
}

function Task(){
    const apiURL=import.meta.env.VITE_API_URL
    let count=0;
    const[task,setTask]=useState({curTask:[],expTask:[]})
    const refs=useRef([])
    const momentRef=useRef()
    const[renderr,controlRender]=useState(0)
    const[momemty,setMoment]=useState("date")
    const[status,setStatus]=useState(true)


    useEffect(()=>{
        async function get(){
            try{
                const res=await axios.get("/api/form/task")
                console.log(res.data)
                console.log(res.data.current)
                console.log(res.data.expired)
                const auth=res.data.status;
                setTask(()=>{
                    return{...task,curTask:res.data.current,expTask:res.data.expired}
                })
                if(auth==="false"){
                    setStatus(auth)
                    console.log("navigating to login page")
                    navigate(`${apiURL}/login`)
                }
            }catch(error){
                console.log(`error=${error}`)
            }

            
        }
        get()
    },[renderr])

    

   


    async function submitted(index){
        const myTask=refs.current[index]
        console.log(myTask.innerHTML);
        const thatTask=myTask.innerHTML;
     
        console.log(thatTask)
        const response=await fetch("/api/form/task",{
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({delTask:thatTask})
        })
        const arr=renderr
        const data=response.json()
        console.log(data)
        setTask(()=>{
            return{...task,curTask:data.current}
        })
        controlRender(prev=>prev+1)
           
        console.log(renderr)

        
    }

    function navigate(url){
        window.location.href=url;
    }

    function goBack(){
        navigate("/home")
    }





   



    return(
       <>
        <div className='expClass'>
            {task.expTask&&task.expTask.map((ele,ind,arr)=>{
                count++
            })}
            <h1>You have {count} expired tasks</h1>
            <table className='expired'>
                <thead>
                    <tr>
                        <th>
                            Expired Tasks
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {task.expTask&&task.expTask.map((ele,ind)=>{
                        const date=moment(ele.date).format('dddd, DD MM YYYY, HH:mm:ss a')
                        return(
                            <tr key={ind}>
                                <td>your task *{ele.task}* expired on {date}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

        </div>
        <div className='container'>
        <button onClick={goBack}>Add Another task</button>
            <div className='card'>
                <table>
                    <thead className='table'>
                        <tr>
                            <th>Task</th>
                            <th>Due Date</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {task.curTask&&task.curTask.map((element,index)=>{
                            const myDate=moment(element.date).format('dddd, DD MM YYYY, HH:mm:ss a')
                            return(
                                <tr key={index}>
                                    <td ref={(el)=>refs.current[index]=el} >{element.task}</td>
                                    <td>{myDate}</td>
                                    <td>
                                        < button  className="close" aria-label='Close' type="button" onClick={()=>submitted(index)}>
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
       </>
    )
}

export default Task