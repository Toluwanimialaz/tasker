import React, { useState, useEffect, useRef, Children } from "react";
import { setDescriptionModal,setCustomAlertModal,setAlertFlash } from "@/store/alertSlice/alertSlice";
import Lottie from "lottie-react";
import animationData from "../../assets/Animation - 1720008044275.json";
import { motion } from "framer-motion";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/navbar";
import Modal from "../../components/modal";
import { useParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { getDetailsFromTimestamp } from "@/utils/helpers/pureFunctions";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa";
import { Tooltip } from 'primereact/tooltip';
import { REQUEST_GOOGLE,GOOGLE_OAUTH } from "@/utils/config/urlConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { MutateGetQuery } from "@/utils/hooks/queryAPI";
import { setIsGoogleRefreshToken } from "@/store/authSlice/authslice";
import { axiosAuth } from "@/utils/config/axios";
import DescriptionBoard from "@/components/misc/descriptionBoard";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/misc/paginatedTable";
import { MutateQuery } from "@/utils/hooks/queryAPI";
import { ADDTASK } from "@/utils/config/urlConfig";
import { useQueryClient,useMutation } from "@tanstack/react-query";



function navigate(url) {
  window.location.href = url;
}

const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
const arr=[]
const mappedWeekdays=[...weekdays]

for(let i=1;i<=4;i++){
  mappedWeekdays.forEach((ele,ind,arrd)=>{
    arr.push(`${i}${i===1?"ST":i===2?"ND":i===3?"RD":"TH"} ${ele}`)
  })
}


console.log("MAPPEDWEEKDAYS",mappedWeekdays.length)

function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
    const navigate = useNavigate();
  const {isGoogleRefreshToken,provider}=useSelector((state)=>state.auth)
  const apiURL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const aniRef = useRef();
  const [stuff, setStuff] = useState({});
  const [modal, setModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [newDate, setNewDate] = useState(new Date());
  const [newTask, setTask] = useState("");
  const [truth, setTruth] = useState("");
  const [date, setDate] = useState(new Date());
  const [dateArr,setDateArr]=useState([])
  const [timeRange1, setTimeRange1] = useState([]);
  const [timeRange2, setTimeRange2] = useState([]);
  const containerRef = useRef(null);
  const containerRef2 = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [centerIndex2, setCenterIndex2] = useState(0);
  const [hours, setHour] = useState(0);
  const [minutes, setMinute] = useState(0);
  const itemHeight = 80;
  const timeRange1Ref = useRef(timeRange1);
  const timeRange1Ref2 = useRef(timeRange2);
  const headingRef=useRef(null)
  const dateArrRef = useRef([]);
  const [displayType, setDisplayType] = useState("oneTime");
  const [position, setPosition] = React.useState("daily");
  const [rotated, setRotated] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [interval,setPeriodInterval]=useState(1)
  const [periodLimit,setPeriodLimit]=useState({daily:365,weekly:52,monthly:12,yearly:10,fortnightly:21});
  const [weekdayArr,setweekDayArr]=useState([])
  const [isVisible,setIsVisible]=useState(false)
  const [tableArr,setTableArr]=useState([])
  const [description,setDescription]=useState("")
  const {mutateAsync:addTask,isError:isErrorTask,isPending:isPendingTask,isSuccess:isSuccessTask,error:errorTask,reset}= MutateQuery(ADDTASK)
  const {mutateAsync:requestGoogle,isPending,isError,error,isSuccess}=MutateGetQuery(`${REQUEST_GOOGLE}?type=home`)
  const columns = [
    {
      accessorKey: "position",
      header: "Position",
      cell: info => info.getValue(),
    },
    {
      accessorKey: "weekday",
      header: "Weekday",
      cell: info => info.getValue(),
    },
    {
      accessorKey: "remove",
      header: "",
      cell: info => info.getValue(),
    },

  ]
  

  useEffect(()=>{
    console.log("TABLE ARR",tableArr)
  },[tableArr])

  useEffect(() => {
    const callGoogle = async () => {
      const params = new URLSearchParams(location.search);
      console.log(location);
      const code = params.get("code");
      console.log("hello world");
      console.log("HOME ROUTE ACTIVE")
      if (code) {
        let payload = {
          Google_code: code,
          type:"home"
        };
        try {
          const response = await axiosAuth.post(GOOGLE_OAUTH, payload);
          const responseData = response?.data;
          console.log(responseData?.data?.error?.message);
          console.log(responseData);
          if ([200, 201].includes(response?.status)) {
            dispatch(
              setCustomAlertModal({
                status: true,
                title: "Integration Successful",
                message: responseData?.message,
                isChecked: true,
              })
            );

            dispatch(setIsGoogleRefreshToken(responseData.data.isGoogleRefreshToken            ))            
          } else {
            dispatch(
              setCustomAlertModal({
                status: true,
                type:"error",
                isChecked:true,
                message: responseData?.message || "error",
              })
            );
          }
        } catch (error) {
          console.log(error);
          console.log(loading);
          dispatch(
            setCustomAlertModal({
              status: true,
              message:
                error.response.data.error.message || "error during integration",
              title: "Integration Error",
              type: "error",
              isChecked: true,
            })
          );
        }
      }
    };
    callGoogle();
  }, []);

  useEffect(() => {
    const Details = getDetailsFromTimestamp(Date.now());
    const dateDetails = getDetailsFromTimestamp(date);
    console.log("DATE DETAILS=", dateDetails);
    const currentHour = Details.hour;
    const currentMinute = Details.minute;
    console.log("CURENT MINUTE", currentMinute, typeof currentMinute);
    const currentDay = Details.day;
    const currentSelectedDay = dateDetails.day;
    console.log("CURRENTDAY=", currentSelectedDay)
    const currentDate = weekdays[currentSelectedDay-1]
    console.log(currentDate)



    // console.log(selectedDay)
    console.log("DATE=", date);
    const dateHandler = () => {
      if (date===undefined&&displayType==="oneTime"){
        setDate(new Date())
        return
      }
      setSelectedDays((prev) => {
        if (
          !prev.includes(currentDate) &&
          date.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
          && !(position==="yearly"||position==="monthly")
        ) {
          console.log("BLADIDI BLAH DI BLAHHHHHHH")
          return [...prev, currentDate];
        } else {
          return prev;
        }
      });
      console.log(selectedDays);
      const Arr = [];
      const Arr2 = [];
      Array.from({ length: 24 }).map((item, index) => {
        if (new Date(date).getDate() === new Date().getDate()
          &&(position==="daily"||position==="weekly"||position==="fortnightly")) {
          if (index >= currentHour) {
            return Arr.push(index);
          }
        } else if (date.getTime() < new Date().getTime()
          &&(position==="daily"||position==="weekly"||position==="fortnightly")) {
          dispatch(
            setAlertFlash({
              status: true,
              message: "You cannot select a past date",
              type: "error",
            })
          );
          new Promise((resolve) => {
            setTimeout(() => {
              return resolve();
            }, 1000);
          }).then(() => setDate(new Date()));

          return;
        } else {
          return Arr.push(index);
        }
      });
      const paddedItems = [
        ...Arr.slice(-3), // clone last N items
        ...Arr,
        ...Arr.slice(0, 3), // clone first N items
      ];
      // console.log(paddedItems)
      setTimeRange1(paddedItems);
      // console.log(Arr);
      Array.from({ length: 60 }).map((item, index) => {
        if (index % 5 === 0) {
          if (index >= currentMinute && centerIndex === currentHour) {
            return Arr2.push(index);
          } else {
            return Arr2.push(index);
          }
        }
      });
      const paddedItems2 = [
        ...Arr2.slice(-3), // clone last N items
        ...Arr2,
        ...Arr2.slice(0, 3), // clone first N items
      ];
      setTimeRange2(paddedItems2);
    }

    dateHandler();

    // console.log(Arr)
  }, [date,JSON.stringify(dateArr),position]);

  useEffect(()=>{
    
    if(dateArr.length!==0){
      console.log("PAST TIME USE EFFECT RAN")
      const isPastTime = dateArr[dateArr.length-1].toISOString()
      const formattedHour = new Date(isPastTime).setHours(hours);
      const formattedMinute = new Date(formattedHour).setMinutes(minutes);
      const formattedDAte = new Date(formattedMinute);
      if(formattedDAte.getTime()<new Date().getTime()){
        setDateArr(prev => prev.slice(0, -1))
        dispatch(
          setAlertFlash({
            status: true,
            message: "You cannot select a past date",
            type: "error",
          })
        );

      }else{
        if(position==="monthly"||position==="yearly"){
          
   
            dateArrRef.current=dateArr.map((ele,ind)=>{
              if(ind===dateArr.length-1){
                dispatch(
                  setAlertFlash({
                    status: true,
                    message: "yayyy",
                    type: "error",
                  })
                );
                const dater= ele.toISOString()
                const formattedHour = new Date(dater).setHours(hours);
                const formattedMinute = new Date(formattedHour).setMinutes(minutes);
                const formattedDAte = new Date(formattedMinute);
                if (
                  Math.floor(formattedDAte.getTime() / 6000) <
                  Math.floor(new Date().getTime() / 6000)
                ) {
                  dispatch(
                    setCustomAlertModal({
                      title: "Error",
                      type: "error",
                      status: true,
                      message: `You picked a time in the past`,
                      isChecked: false,
                    })
                  );
                  return
                 }

                 console.log("FORMATTED DATE=",formattedDAte)
                 console.log("DATE ARR",dateArr)
         
                 return formattedDAte
              }else{
                return ele
              }
                
        
            })
      
        }
      }
    }
    
  },[JSON.stringify(dateArr)])

  useEffect(()=>{
    if(position==="monthly"||position==="yearly"){
      setSelectedDays([])
    }

    console.log("DATE=",date)

   

  },[position])

  useEffect(() => {
    console.log("hour state changed TO:", hours);
    console.log("minute state changed TO:", minutes);
  }, [hours, minutes]);// useless useeffect DELETE

  useEffect(() => {
    timeRange1Ref.current = timeRange1;
    timeRange1Ref2.current = timeRange2;
    if(dateArr.length!==0){
      setDateArr(dateArrRef.current)
    }else{
      dateArrRef.current=[]
    }
  
  }, [timeRange1, timeRange1Ref2,dateArr]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      //   console.log(window.innerWidth)
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [innerWidth]);

  useEffect(() => {
    const attachListeners = () => {
      const container = containerRef.current;
      const container2 = containerRef2.current;

      if (!container || !container2) {
        setTimeout(attachListeners, 100);
        return;
      }

      const handleScrollOne = handleScrollController(setCenterIndex);
      const handleScrollTwo = handleScrollController(setCenterIndex2);

      if (container)
        container.addEventListener("scroll", handleScrollOne, {
          passive: true,
        });
      if (container)
        container.addEventListener("scroll", firstDetecthandler, {
          passive: true,
        });
      if (container2)
        container2.addEventListener("scroll", handleScrollTwo, {
          passive: true,
        });
      if (container2)
        container2.addEventListener("scroll", secondDetecthandler, {
          passive: true,
        });

      return () => {
        container.removeEventListener("scroll", handleScrollOne);
        container.removeEventListener("scroll", firstDetecthandler);
        container2.removeEventListener("scroll", secondDetecthandler);
        container2.removeEventListener("scroll", handleScrollTwo);
      };
    };
    const cleanup = attachListeners();

    return () => {
      if (cleanup) cleanup();
    };
  }, [displayType]);

  useEffect(() => {
    let tries = 0;
    let maxTries = 10;

    const tryScroll = () => {
      const el = containerRef.current;
      const el2 = containerRef2.current;
      if (el && el.children.length > 4 && el2 && el2.children.length > 4) {
        console.log("THis useeffect ran");
        const firstRealItem = el.children[3];
        const firstRealItem2 = el2.children[3];
        const itemHeight = firstRealItem.offsetHeight;
        const itemHeight2 = firstRealItem2.offsetHeight;
        console.log("item-height useeffect", itemHeight);
        if (firstRealItem) {
          console.log("THis useeffect ran2");
          console.log("first real item useeffect", firstRealItem);

          el.scrollTo({ top: itemHeight * 3 }); // index 3
        }
        if (firstRealItem2) {
          console.log("THis useeffect ran2");
          console.log("second real item useeffect", firstRealItem2);

          el2.scrollTo({ top: itemHeight2 * 4 }); // index 3
        }

        return;
      }

      if (tries < maxTries) {
        console.log("TRY= ", tries);
        tries++;
        setTimeout(tryScroll, 1000);
      }
    };

    tryScroll();
  }, [timeRange1, timeRange2, displayType]); // ← dependencies that guarantee children exist

  useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => setIsVisible(entry.isIntersecting),
       { threshold: 0.5 }
     );
 
     if (headingRef.current) {
       observer.observe(headingRef.current);
     }
 
     return () => {
       if (headingRef.current) observer.unobserve(headingRef.current);
     };
  }, []); 


  
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(fn(...args), delay);
    };
  };

  const getItemHeight = (el) => {
    const first = el.children[0];
    const second = el.children[1];
    if (!first || !second) return 0;

    const h =
      second.getBoundingClientRect().top - first.getBoundingClientRect().top;
    console.log("item height=", h);
    return h;
  };

  const detectScrollpointHandler = (timeRange1Ref) => {
    const detectScollPoint = (event) => {
      // console.log(event)
      const newUpdatedTimeRangeRef = timeRange1Ref.current;
      if (!newUpdatedTimeRangeRef) {
        console.log("newupdatedtimerange does not exist for detectscrollpoint");
        return;
      }
      // console.log(newUpdatedTimeRangeRef)
      const trimmedTimeRange = newUpdatedTimeRangeRef.slice(3, -3);
      const buffer = 2;
      // console.log(trimmedTimeRange)
      const container = event.target;
      if (!container) {
        console.log("container does not exist for detectscrollpoint");
        return;
      }
      const firstRealItem = container.children[3];
      const oneItemWidth = firstRealItem.offsetHeight;


      const scrollTop = Math.round(container.scrollTop);
      const maxScroll = container.scrollHeight - container.clientHeight;
      const threshold = itemHeight * 1.5;
      const wildCard = innerWidth < 820 ? itemHeight : 40;
      
      console.log("SCROLL-TOP=",scrollTop)
      console.log("ITEM-HEIGHT",itemHeight)
      console.log("MAX-SCROLL",maxScroll)
      console.log("CLIENT-HEIGHT",container.clientHeight)
      console.log("SCROLL-HEIGHT",container.scrollHeight)
      console.log("HEIGHT OF ONE ITEM",oneItemWidth)

      // Scrolled to bottom (past last real item)
      // if (scrollTop >= maxScroll - itemHeight) {
      //   // Reset to first real item (index 1)
      //   container.scrollTop = itemHeight * 1 + (scrollTop % (trimmedTimeRange.length * itemHeight));
      // }
      // // Scrolled to top (before first real item)
      // else if (scrollTop <= itemHeight) {
      //   // Reset to last real item
      //   container.scrollTop =
      //     itemHeight * trimmedTimeRange.length ;
      // }
      if (scrollTop >= maxScroll - itemHeight - buffer) {
        const newScroll =
          itemHeight * 1 + (scrollTop % (trimmedTimeRange.length * itemHeight));
        requestAnimationFrame(() => {
          container.scrollTop = newScroll;
        });
      }

      // Scrolled to top
      else if (scrollTop <= itemHeight) {
        const newScroll = itemHeight * trimmedTimeRange.length + wildCard;
        requestAnimationFrame(() => {
          container.scrollTop = newScroll;
        });
      }
    };

    const debouncedScroll = debounce(detectScollPoint, 50);

    return function handler(event) {
      debouncedScroll(event);
    };
  };

  const firstDetecthandler = detectScrollpointHandler(timeRange1Ref);
  const secondDetecthandler = detectScrollpointHandler(timeRange1Ref2);

  const pickCalendarSize = () => {
    if (windowWidth < 431) return "sm";
    if (windowWidth > 430 && windowWidth < 1000) return "icon";
    if (windowWidth > 1000) return "lg";

    return "icon";
  };

  const toggleActiveButton = (activeBtn, inactiveBtn) => {
    if (activeBtn) {
      activeBtn.classList.add("active");
    }
    if (inactiveBtn) {
      inactiveBtn.classList.remove("active");
    }
    const period = document.getElementById("period");
    const oneTime = document.getElementById("oneTime");

    if (activeBtn === period) {
      setDisplayType("period");
    } else {
      setDisplayType("oneTime");
    }
  };

  const setDisplayTrigger=(display,notDisplay)=>{
    setDisplayType(display)
    toggleActiveButton(document.getElementById(display),document.getElementById(notDisplay))
  }

  const handleScrollController = (setGenericCenterIndex) => {
    const Details = getDetailsFromTimestamp(Date.now());
    const currentHour = Details.hour;
    const handleScroll = (event) => {
      const container = event.target;
      if (!container) {
        console.log("container for handlescroll does not exist");
        return;
      }

      const children = Array.from(container.children);
      const containerRect = container.getBoundingClientRect();
      const containerCenterY = containerRect.top + containerRect.height / 2;

      // if(scrolledToTop){
      //     return setCenterIndex(0)
      // }
      // if(scrolledToBottom){
      //     return setCenterIndex(children.length-1)
      // }

      const closestIndex = children.reduce((closestIdx, child, idx) => {
        const childRect = child.getBoundingClientRect();
        const childCenterY = childRect.top + childRect.height / 2;

        const distance = Math.abs(childCenterY - containerCenterY);
        const closestChildRect = children[closestIdx].getBoundingClientRect();
        const closestChildCenterY =
          closestChildRect.top + closestChildRect.height / 2;
        const closestDistance = Math.abs(
          closestChildCenterY - containerCenterY
        );

        return distance < closestDistance ? idx : closestIdx;
      }, 1);

      if (setGenericCenterIndex === setCenterIndex) {
        console.log("yay");
        setHour((prev) => {
          console.log(prev);
          console.log(timeRange1Ref.current[closestIndex]);
          return timeRange1Ref.current[closestIndex];
        });
      } else {
        setMinute(timeRange1Ref2.current[closestIndex]);
      }

      console.log("closestIndex=", closestIndex);
      console.log(
        "CHIid corr to closestindex",
        Number(children[closestIndex].textContent)
      );
      console.log(timeRange1Ref);

      return setGenericCenterIndex(closestIndex);
    };

    return handleScroll;
  };

  const selectDays = (item) => {
    console.log("blah");
    console.log(selectedDays);
    setSelectedDays((prev) => {
      if (prev.includes(item)) {
        if (prev.length === 1 && !(position==="yearly"||position==="monthly")) {
          return prev;
        }
        const cleaned = prev.filter((items) => items !== item);
        return cleaned;
      } else {
        return [...prev, item];
      }
    });
  };

  const saveDetails = async() => {
    if(!interval){
      dispatch(
        setCustomAlertModal({
          title:'Error',
          type:"error",
          status:true,
          message:"you must set an Interval",
          isChecked:true
        })
      )
      return
    }
    if((position==="monthly"||position==="yearly")&&dateArr.length===0){
      dispatch(
        setCustomAlertModal({
          title:'Error',
          type:"error",
          status:true,
          message:`you must set at least one date`,
          isChecked:true
        })
      )
      return
    }
    const formattedHour = new Date(date).setHours(hours);
    const formattedMinute = new Date(formattedHour).setMinutes(minutes);
    const formattedDAte = new Date(formattedMinute);
    const isoDateArr=dateArr.map(ele=>ele.toISOString())
    if (
      (Math.floor(formattedDAte.getTime() / 6000) <
      Math.floor(new Date().getTime() / 6000))&&
      (position!=="monthly"&&position!=="yearly")

    )
     {
      dispatch(
        setCustomAlertModal({
          title: "Error",
          type: "error",
          status: true,
          message: "You picked a time in the pastrrr",
          isChecked: false,
        })
      );
      return;
    }
    // const modifiedDate=date.setHours(centerIndex)
    console.log("INDEXES", centerIndex, centerIndex2);

    setDate(formattedDAte);



    
    const weeksRep = position==="monthly"||position==="yearly"? weekdayArr
    .map(str => str.replace(/(ST|ND|RD|TH)/, "")) // remove ordinal suffix
    .map(str => str.replace(" ", ""))             // remove space
    .join(",") :""


   const selectedDaysArr=selectedDays.map((item)=>item.slice(0,2).toUpperCase())

    const selectedDaysString = selectedDaysArr
    .join(",")

    console.log("WEEKSREP=",weeksRep)
    console.log("WEEKDAYARR=",weekdayArr)


    const unionDaysAndWeeks=`${weeksRep}${weeksRep.length>0&&selectedDaysString.length>0?",":""}${selectedDaysString}`


    

  


    const isoString = formattedDAte.toISOString();
    const unionDate=position==="monthly"||position==="yearly"?isoDateArr:isoString
    const taskDetails = {
      date: unionDate,
      type: displayType,
      description:description
    };

    const payload = {
      ...taskDetails,
      ...(displayType === "period" && { periodType: position }),
      ...(displayType === "period" && { interval: interval }),
      ...(displayType === "period" &&
      { daysWeeksRepeated: unionDaysAndWeeks}),
    };
    console.log(payload);
    // dispatch(
    //   setDescriptionModal({
    //     status: true,
    //     title: "Describe your task",
    //     payload: payload,
    //   })
    // );
    try{
      console.log("ispending",isPendingTask)
      console.log("iserror",isErrorTask)
      console.log("error",errorTask)
      console.log("issuccess",isSuccessTask)
      const res=await addTask(payload,"task")
      console.log(res)
      dispatch(
        setCustomAlertModal({
          status: true,
          title: "Successful",
          message: res?.message,
          isChecked: true,
        })
      );
      
      

  }catch(error){
      console.log(error)
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
  };

  const periodLimter=(event)=>{
    const input=event.target.value;
    console.log(typeof(input))
    console.log(input)
    if(position==="daily"&& input>periodLimit.daily||position==="weekly"&& input>periodLimit.weekly||
      position==="monthly"&& input>periodLimit.monthly||position==="fortnightly"&& input>periodLimit.fortnightly||
      position==="yearly"&& input>periodLimit.yearly
    ){
      dispatch(
        setAlertFlash({
        status:true,
        message:`Your interval of ${input} is above the limit ${periodLimit[`${position}`]} of ${position} interval`,
      }))
      return setPeriodInterval((prev)=>prev)
    }

    if(input<=0 && input){
      return setPeriodInterval((prev)=>prev)
    }

    setPeriodInterval(input === "" ? "" : Number(input))


  }

  const changeCalendarType=()=>{
    console.log(dateArr)
    return position==="monthly"&&displayType==="period"||position==="yearly"&&displayType==="period"?"multiple":"single"
  }

  const mode = changeCalendarType()

  const clickWeekday=(item)=>{
   
    setweekDayArr((prev)=>{
      console.log(`weekdayArr=${prev}`)
      console.log(`dateArr=${dateArr}`)
      if(prev.includes(item)){
        const arr=prev.filter((ele)=>ele!==item)
        return arr
      }else{
        return [...prev,item]
      }
    })


  }

  const googleReq = async () => {
    try{
      const response=await requestGoogle()
      console.log(response)
      window.location.href = response.url;


    }catch(error){
      console.log(error)
      if(error){
        dispatch(setCustomAlertModal({
          status:true,
          message: "error during Login in",
          type:"error",
          isChecked:true
        }))
      }
    }
  };

  function handleTask(event) {
    const value = event.target.value;
    setTask(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const w = event.target;
    console.log(w);

    const dataa = new FormData(w);
    const textData = new URLSearchParams(dataa);
    console.log(...dataa);
    const response = await fetch(`${apiURL}/api/form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ task: newTask, date: newDate }),
    });

    const data = await response.json();
    alert(data.message);
    navigate("/home/task");
  }

  function handleChange(date) {
    setNewDate(date);
  }

  function handleOpen() {
    setModal(true);
    console.log(modal);
  }

  function handleClose() {
    setModal(false);
    console.log(modal);
  }

  // useEffect(()=>{
  //     fetch(`${apiURL}/api`, {
  //         method: 'GET',
  //         credentials: 'include', // Ensures cookies are sent in the request
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //     })
  //     .then(data=>data.json())
  //     .then(res=>{
  //         console.log(res)
  //         setStuff(res)
  //         const auther=res.status
  //         console.log(auther)
  //         if(auther==="false"){
  //             setTruth(res.status)
  //             console.log(`truth=${truth}`)
  //             console.log("navigating to login page")
  //             navigate(`/login`)
  //         }
  //     })
  //     .catch(err=>console.log(err))
  // },[truth])

  return (
    <div className="home w-screen h-screen bg-rgb(232, 225, 225)">
      <div className="home-container">
        <div className="toggler">
          {/* <h1>Schedule your task</h1> */}
          <div className="toggle-buttons toggleHeight">
            <button
              id="oneTime"
              className="active"
              onClick={() => {
                toggleActiveButton(
                  document.getElementById("oneTime"),
                  document.getElementById("period")
                );
              }}
            >
              <span>ONE-TIME</span>
            </button>
            <button
              id="period"
              onClick={() => {
                toggleActiveButton(
                  document.getElementById("period"),
                  document.getElementById("oneTime")
                );
              }}
            >
              <span>PERIODIC</span>
            </button>
          </div>
        </div>
          <div className={displayType==="period"&&(position==="monthly"||position==="yearly")?"calendar-container-monthly mt-3":"calendar-container"}>
            <Calendar
              mode={mode}
              defaultMonth={date}
              selected={mode === "multiple" ? dateArr : date}
              onSelect={mode === "multiple" ? setDateArr: setDate}
              captionLayout="dropdown"
              className="rounded-lg border shadow-lg"
              sizer={pickCalendarSize()}
            />
            {(displayType==="period"&&(position==="monthly"||position==="yearly"))?(
             <div className="w-4/5 xl:w-1/3 overflow-x-auto rounded-lg border border-border bg-background shadow-sm">
              <DataTable data={tableArr} columns={columns} setTableArr={setTableArr} setWeekDayArr={setweekDayArr}/>
               {/* <h4>Week days to repeat</h4>
               <div className="weekday-grid">
                {arr.map((ele,ind)=>(
                  <div key={ind} className={`box ${weekdayArr.includes(ele) ? "selected" : ""}`} onClick={(event)=>clickWeekday(ele)}>
                    <span>{ele.slice(0,1)}{""}</span>
                    <span className="uppercase">{ele.slice(1,3)}{""}</span>
                    <span>{ele.slice(-2)}</span>

                  </div>
                ))}

              </div> */}
             </div>
            ):(
              <div ref={headingRef} className={`calendar-heading ${isVisible?"animated-in":""}`}>
                <h1>
                  Select a starting Date on the calendar,
                </h1>
                <div className="rowOrCol">
                  <div className="subtext">
                    Please note that if your event is periodic and monthly or periodic and yearly you can pick multiple dates.
                  </div>
                  <div>
                    <button className="unique-button"
                     onClick={()=>{
                      navigate("/dashboard")
                     }}
                    >
                      View Events
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-screen flex flex-col items-center">
            <h1 className="clock-heading">Select a time</h1>
            <div className="select-div">
              <div
                className="timerange-hour snap-y snap-mandatory smooth-scroll"
                ref={containerRef}
              >
                {timeRange1.map((item, index) => (
                  <div style={{ height: "80px", flexShrink: "0" }} key={index}>
                    <h1
                      className="carousel-item snap-center"
                      key={index}
                      style={
                        index === centerIndex
                          ? { opacity: "1" }
                          : { opacity: "0.5" }
                      }
                    >
                      {item < 10 ? `0${item}` : item}
                    </h1>
                  </div>
                ))}
              </div>
              <h1 className="colon">:</h1>
              <div
                className="timerange-hour snap-y snap-mandatory smooth-scroll"
                ref={containerRef2}
              >
                {timeRange2.map((item, index) => (
                  <div style={{ height: "80px", flexShrink: "0" }} key={index}>
                    <h1
                      className="carousel-item snap-center"
                      style={
                        index === centerIndex2
                          ? { opacity: "1" }
                          : { opacity: "0.5" }
                      }
                    >
                      {item < 10 ? `0${item}` : item}
                    </h1>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        
        {/* {displayType === "oneTime" ? (
          <div></div>
        ) : (
          <div className="period-div">
            <Tooltip target=".inputer"  position="top"content={"select the interval between your period type. Note that whatever period type you choose i.e daily would determine the type of interval in that case; days"}
             className="tooltiper"
            />
            <div className="dropdown-selector">
              <div className="box">
                <h5>DURATION</h5>
                <DropdownMenu
                  onOpenChange={() => {
                    setRotated((prev) => !prev);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {position.toUpperCase()}
                      <span
                        className={`rotated-span ${rotated ? "rotated" : ""}`}
                      >
                        <FaAngleRight />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Periods</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={position}
                      onValueChange={setPosition}
                    >
                      <DropdownMenuRadioItem value="daily">
                        Daily
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="weekly">
                        Weekly
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="fortnightly">
                        Fortnightly
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="monthly">
                        Monthly
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="yearly">
                        yearly
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
              <div className="box">
                <h5>INTERVAL</h5>
                <input onChange={(e)=>periodLimter(e)} value={interval} type="number" className="inputer"/>
              </div>
              
              
            </div>
            {position &&(
              <div className="day-div">
                {weekdays.map((item, index) => (
                  <div
                    onClick={() => selectDays(item)}
                    className={`day-circles ${selectedDays.includes(item) ? "selected-day" : ""}`}
                    key={index}
                  >
                    {displayType==="period"&&(position==="monthly"||position==="yearly")?(
                      <div>
                        <div>ALL</div>
                        <div>{`${item.toLocaleUpperCase()}'S`}</div>
                      </div>
                    ):(
                      <span>{item.toLocaleUpperCase()}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )} */}
        <DescriptionBoard displayType={displayType} setDisplayType={setDisplayTrigger} periodType={position} positionSetter={setPosition} setWeeksArr={setTableArr}
         setMonthDays={setweekDayArr} interval={interval} periodLimter={periodLimter} setSelectedDays={setSelectedDays} selectedDays={selectedDays}
         description={description} setDescription={setDescription} saveTask={saveDetails}
         googleReq={googleReq} isPending={isPending}
         />
      
      </div>
    </div>

    // <div  className='background'>
    //     <Lottie onComplete={()=>{
    //         console.log("complete");
    //         aniRef.current?.goToAndPlay(1,true);
    //         aniRef.current?.play()
    //     }} lottieRef={aniRef} animationData={animationData} loop={false} style={{height:"25%",position:"absolute",top:"0",margin:"0% 40%"}}/>
    //     <Navbar className='nav'  name={stuff.names}/>
    //     <div className='title' style={{position:"absolute",top:'330px',width:'90%'}}>
    //         <motion.div
    //             initial={{ opacity: 0 }}
    //             animate={{ opacity: 1 }}
    //             transition={{ duration: 2 }}
    //         >
    //             <h2>Welcome to your personal Task manager,{stuff.names}</h2>
    //             <h4>To Add a task click the button below</h4>
    //         </motion.div>
    //         <Modal handleTask={handleTask} handleOpen={handleOpen} handleClose={handleClose} modals={modal} handleChange={handleChange} handleSubmit={handleSubmit} date={newDate}/>
    //     </div>

    // </div>
  );
}

export default Home;
