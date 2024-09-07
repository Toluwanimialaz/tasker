import React,{useState,useEffect,useRef} from 'react'
import Lottie from 'lottie-react'
import animationData from '../../assets/Animation - 1720008044275.json'
import { motion } from 'framer-motion';
import axios from 'axios'
import './style.css'
import Navbar from '../../components/navbar'
import Modal from '../../components/modal'
import { useParams } from 'react-router-dom';

function handleClick(){

}

function navigate(url){
    window.location.href=url;
}



function Home(){
    const apiURL=import.meta.env.VITE_API_URL
    const {id}=useParams()
    const aniRef=useRef()
    const[stuff,setStuff]=useState({})
    const[modal,setModal]=useState(false)
    const[newDate,setNewDate]=useState(new Date())
    const[newTask, setTask]=useState("")
    const[truth,setTruth]=useState('')

    function handleTask(event){
        const value=event.target.value;
        setTask(value)
    }

    async function handleSubmit(event){
        event.preventDefault()
        const w= event.target;
        console.log(w);

        const dataa=new FormData(w)
        const textData=new URLSearchParams(dataa)
        console.log(...dataa)
        const response=await fetch('https://task-backend-7r94.onrender.com/api/form',{
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body:JSON.stringify({task:newTask,date:newDate})
        })

        const data=await response.json()
        alert(data.message)
        navigate("/home/task")
    }

    function handleChange(date){
        setNewDate(date)
    }

    function handleOpen(){
        setModal(true)
        console.log(modal)
    }

    function handleClose(){
        setModal(false)
        console.log(modal)
    }


    useEffect(()=>{
        fetch('https://task-backend-7r94.onrender.com/api', {
            method: 'GET',
            credentials: 'include', // Ensures cookies are sent in the request
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(data=>data.json())
        .then(res=>{
            console.log(res)
            setStuff(res)
            const auther=res.status
            console.log(auther)
            if(auther==="false"){
                setTruth(res.status)
                console.log(`truth=${truth}`)
                console.log("navigating to login page")
                navigate(`/login`)
            }
        })
        .catch(err=>console.log(err))
    },[truth])

    return(
        <div  className='background'>
            <Lottie onComplete={()=>{
                console.log("complete");
                aniRef.current?.goToAndPlay(1,true);
                aniRef.current?.play()
            }} lottieRef={aniRef} animationData={animationData} loop={false} style={{height:"150px",position:"absolute",top:"0px",right:"550px"}}/>
            <Navbar className='nav'  name={stuff.names}/>
            <div className='title' style={{position:"absolute",top:'330px',width:'90%'}}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <h2>Welcome to your personal Task manager,{stuff.names}</h2>
                    <h4>To Add a task click the button below</h4>
                </motion.div>
                <Modal handleTask={handleTask} handleOpen={handleOpen} handleClose={handleClose} modals={modal} handleChange={handleChange} handleSubmit={handleSubmit} date={newDate}/>
            </div>
            
        </div>
    )
}



export default Home