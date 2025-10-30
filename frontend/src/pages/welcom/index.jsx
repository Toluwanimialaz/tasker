import React, { useRef,useEffect,useState } from "react";

import GoogleButtonn from "react-google-button";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import animation from "../../assets/Animation - 1720004657114.json";
import { axiosAuth } from "../../utils/config/axios";
import { TEST } from "../../utils/config/urlConfig";
import { GiBullseye } from "react-icons/gi";
import { Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious} from "@/components/ui/carousel"
import Image1 from '../../../public/images/tasker6.png'
import Image2 from '../../../public/images/freelancer.png'
import Image3 from '../../../public/images/tasker1.webp'
import { current } from "@reduxjs/toolkit";

function Welcom() {
  const aniRef = useRef();
  const apiURL = import.meta.env.VITE_API_URL;
  const cardRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [current, setCurrent] = useState(0)
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState("fade-in");

  const myObject=[
    {
        feature:"1this is some stuff blah blah blah that we offfer blah diblo this is some stuff blah blah blah that we offfer blah diblothis is some stuff blah blah blah that we offfer blah diblo",
        image:Image1
    },
    {
        feature:"2this is some stuff blah blah blah that we offfer blah diblo this is some stuff blah blah blah that we offfer blah diblothis is some stuff blah blah blah that we offfer blah diblo",
        image:Image2
    },
    {
        feature:"3this is some stuff blah blah blah that we offfer blah diblo this is some stuff blah blah blah that we offfer blah diblothis is some stuff blah blah blah that we offfer blah diblo",
        image:Image3
    },
    
    
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  useEffect(() => {
    const div = scrollRef.current;
    const handleScroll = () => {
      if (div && div.scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    div?.addEventListener("scroll", handleScroll);
    return () => div?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(()=>{
    // if(index<myObject.length){
    //     const timer=setTimeout(()=>{
    //         setIndex((prev)=>{
    //             if(prev===myObject.length-1){

    //                 return 0
    //             }else{
    //                 return prev+1
    //             }
    //         })
    //     },3000)

    //     return ()=> clearTimeout(timer)
    // }
    const fadeInTimeout = setTimeout(() => {
        setFade("fade-out");
      }, 6000); 

    const timer= setInterval(() => {
        setFade("fade-in");
        setCurrent(prev => (prev + 1) % myObject.length)
    }, 7000)

    return () => {
        clearInterval(timer);
        clearInterval(fadeInTimeout)
    }
  },[current])

  const handleEndpoint = async () => {
    try {
      const response = await axiosAuth.get(TEST);
      const responseData = response.data;
      console.log(responseData);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="blad ">
        <div className="hero">
            <div className="hero-div">
                <h1>MANAGE YOUR LIFE ALL IN ONE PLACE</h1>
                <p>keep track of everything you do on tasker appkeep track of everything you do on tasker appkeep track of everything you do on tasker appkeep track of everything</p>
                <button>Get Started</button>
            </div>
            <div className="hero-image">
                <img src="./images/tasker4.png"/>
            </div>
        </div>
        <div className="bait-div">
            <h1>WHAT WE OFFER</h1>
        </div>
        <div className="offer-div">
            {Array.from({length:4}).map((item)=>(
                <div ref={cardRef} className={`offer-child flex flex-col justify-between items-center ${isVisible?"animated-in":""}`}>
                    <div className="offer-topic flex flex-row  items-center">
                        <div className="bullseye">
                            <GiBullseye className="react-iconn"/>
                        </div>
                        <h4>Something here</h4>
                    </div>
                    <p>some unique text about some stuff we offer yadder yadddi ya</p>
                </div>
            ))}
        </div>
        <div className="carousel-div">
            <h1>SOME OF OUR FEATURES</h1>
            <div className="feature-div">
                <div className={`changing-words ${fade}`}>
                    <p>
                        {myObject[current].feature}

                    </p>
                </div>
                <div className="carousel-content">
                <Carousel >
                    <CarouselContent
                        style={{ transform: `translateX(-${current * 100}%)`, transition: 'transform 0.5s ease-in-out' }}
                        className="flex"
                    >
                        {myObject.map((img, i) => (
                        <CarouselItem key={i} className="car-item">
                            <img
                            src={img.image}
                            className="object-cover rounded-lg"
                            />
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                </div>
                {/* <img className="fade-in" src={myObject[index].image}/> */}
            </div>
        </div>
          <div>
        {/* <h1 className='manage'>Managing your life just got easier with My task manager</h1>
                <p className='words'>Signup with the buttons below and make your life easier</p> */}
        {/* <div className='google'>
                    <Link to={`${apiURL}/api/auth/google`}>
                        <GoogleButtonn className='signUp'/>
                    </Link>
                    <Link to="/signup">
                        <button className='boot' type='submit'>Sign up</button>
                    </Link>
                </div> */}
      </div>
      {/* <Lottie className='clip' onComplete={()=>{
                aniRef.current?.play();
                aniRef.current?.goToAndPlay(1,true);
                console.log("complete");
            }} lottieRef={aniRef} animationData={animation} loop={false} style={{height:"50%",width:"38vw",position:"relative",top:"-20%",right:"-55%"}}/> */}
    </div>
  );
}


export default Welcom;
