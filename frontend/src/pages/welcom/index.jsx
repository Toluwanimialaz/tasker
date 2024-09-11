import React,{useRef}from 'react';
import './style.css'
import GoogleButtonn from 'react-google-button'
import {Link} from 'react-router-dom'
import Lottie from 'lottie-react'
import animation from '../../assets/Animation - 1720004657114.json'

function Welcom(){
    const aniRef=useRef()
    const apiURL=import.meta.env.VITE_API_URL
    return(
        <div className='bla'>
            <div>
                <h1 className='manage'>Managing your life just got easier with My task manager</h1>
                <p className='words'>Signup with the buttons below and make your life easier</p>
                <div className='google'>
                    <Link to={`${apiURL}/api/auth/google`}>
                        <GoogleButtonn className='signUp'/>
                    </Link>
                    <Link to="/signup">
                        <button className='boot' type='submit'>Sign up</button>
                    </Link>
                </div>
            </div>
            <Lottie className='clip' onComplete={()=>{
                aniRef.current?.play();
                aniRef.current?.goToAndPlay(1,true);
                console.log("complete");
            }} lottieRef={aniRef} animationData={animation} loop={false} style={{height:"50%",width:"38vw",position:"relative",top:"-20%",right:"-55%"}}/>
        </div>

    )
}



export default Welcom