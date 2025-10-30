import { Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious } from "../ui/carousel"
import { useSelector,useDispatch } from "react-redux"
import { Button,buttonVariants } from "../ui/button"
import { useState,useRef, useEffect } from "react"
import {formatDateWithOrdinal,sortWeekdays,getEarliestDate}from '../../utils/helpers/pureFunctions'
import { ImBin } from "react-icons/im";
import { update,DELETETASK} from "@/utils/config/urlConfig"
import { axiosAuth } from "@/utils/config/axios"
import { useQueryClient,useMutation } from "@tanstack/react-query";
import { MutateQuery,useFetchQuery,MutateGetQuery} from "@/utils/hooks/queryAPI"
import { setCustomAlertModal,setDeleteModal } from "@/store/alertSlice/alertSlice"
import PageLoading  from "../loading/PageLoading"



export default function Taskscroller({current,expired}){
    const[centerIndex,setCenterIndex]=useState(current.length<=3?1:0);
    const containerRef = useRef(null);
    const [currentArr,setCurrentArr]=useState([])
    const [timeArr,setTimeArr]=useState({})
    const currentRef=useRef(null)
    const itemWidth=500;
    const dispatch=useDispatch()
    const {mutateAsync:deleteTask,isError:isDeleteError,isPending:isDeletePending,isSuccess:isDeleteSuccess,error:deleteError,reset}= MutateQuery(DELETETASK);
    const {mutateAsync:dummy,isError:isDummyError,isPending:isDummyPending,isSuccess:isDummySuccessful,error:dummyError}= MutateGetQuery("/ip")
    // const{data,isLoading,isError:isError2,error:error2}=FetchQuery("update",update)

    const{taskError}=useSelector((state)=>state.task);

    useEffect(()=>{
        console.log("CURRENT LENGTH",current.length)
        
        const paddedItems =current.length>2? [
            ...current.slice(-3), // clone last N items
            ...current,
            ...current.slice(0, 3) // clone first N items
        ]:[...current]

        setCurrentArr(paddedItems)
    },[current])

    useEffect(()=>{
        currentRef.current=currentArr

    },[currentArr])

    useEffect(()=>{
        let tries=0
        const maxTries=10;
        console.log("ran")
        const attachListeners=()=>{
            const container=containerRef.current;

            if(!container){
                console.log(tries)
                tries++
            if(tries<maxTries){
                setTimeout(attachListeners,100)
            }else{
                return
            }

                return
            }

            if(container){
                console.log("container exists")
                container.addEventListener("scroll",handleScroll, {
                    passive: true,
                });
            }

            if(container){
                container.addEventListener("scroll",Detecthandler, {
                    passive: true,
                });
            }

            return ()=>{
                container.removeEventListener("scroll",handleScroll);
                container.removeEventListener("scroll",Detecthandler);
            }
        }

        const cleanup=attachListeners()

        return ()=>{
            if(cleanup) cleanup()
  
        }

    },[currentArr])

    useEffect(() => {
        let tries = 0;
        let maxTries = 10;

        const tryScroll = () => {
        const el = containerRef.current;
        if (el && el.children.length > 4) {
            console.log("THis useeffect ran");
            const firstRealItem = el.children[3];
            const oneItemWidth = firstRealItem.offsetWidth;
            console.log("item-width useeffect", oneItemWidth);
            if (firstRealItem) {
            console.log("THis useeffect ran2");
            console.log("first real item useeffect", firstRealItem);

            el.scrollTo({ left: oneItemWidth * 5 }); // index 3
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
    }, [currentArr]);

    const debounce = (fn, delay) => {
        let timeout;
        return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(fn(...args), delay);
        };
    };

    const exUpdate=async(event,item)=>{

        dispatch(setDeleteModal({
            status:true,
            title:"How do you want to delete your events",
            payload:JSON.stringify(item)
        }))
       


    }


    const handleScroll = (event) => {
        const container = event.target;
    //   console.log(event)
        if (!container) {
        console.log("container for handleScroll does not exist");
        return;
        }
    
        const children = Array.from(container.children);
        const containerRect = container.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
    
        const closestIndex = children.reduce((closestIdx, child, idx) => {
        const childRect = child.getBoundingClientRect();
        const childCenterX = childRect.left + childRect.width / 2;
    
        const distance = Math.abs(childCenterX - containerCenterX);
        const closestChildRect = children[closestIdx].getBoundingClientRect();
        const closestChildCenterX =
            closestChildRect.left + closestChildRect.width / 2;
        const closestDistance = Math.abs(
            closestChildCenterX - containerCenterX
        );
    
        return distance < closestDistance ? idx : closestIdx;
        }, 1);
    
    //   console.log("closestIndex=", closestIndex);
    //   console.log(
    //     "Child corr to closestIndex",
    //     Number(children[closestIndex].textContent)
    //   );
    
        return setCenterIndex(closestIndex);
    };

    const detectDebounceHandler=()=>{
        const detectScrollPoint = (event) => {
            const newUpdatedTimeRangeRef = currentRef.current;
            if (!newUpdatedTimeRangeRef) {
            console.log("newupdatedtimerange does not exist for detectscrollpoint");
            return;
            }
        
            const trimmedTimeRange = newUpdatedTimeRangeRef.slice(3, -3);
            const buffer = 5;
            const container = event.target;
            console.log("the scroll container is=", container)
            if (!container) {
            console.log("container does not exist for detectscrollpoint");
            return;
            }
    
            console.log("displayed Array",newUpdatedTimeRangeRef.length)
            console.log("trimmed Array",trimmedTimeRange.length)
    
            console.log("detecteeeting")
        
            const scrollLeft = Math.round(container.scrollLeft);
            const maxScroll = container.scrollWidth - container.clientWidth;
            console.log("SCROLL-WIDTH=",container.scrollWidth)
            console.log("CLIENT-WIDTH=",container.clientWidth)
            const threshold = itemWidth * 1.5; // horizontal version uses itemWidth
            const wildCard = innerWidth < 820 ? 100 : 100;
            console.log("SCROLL LEFT=",scrollLeft)
            console.log("ITEMWIDTH",itemWidth)
            console.log("MAXSCROLL",maxScroll)
            const firstRealItem = container.children[3];
            const oneItemWidth = firstRealItem.offsetWidth;
            console.log("ONE_ITEM_WIDTH=",oneItemWidth)
        
            // Scrolled to right
            if (scrollLeft >= maxScroll - oneItemWidth- buffer) {
            const newScroll =
                oneItemWidth * 1 + (scrollLeft % (trimmedTimeRange.length * oneItemWidth));
                const wildo=scrollLeft % (trimmedTimeRange.length * itemWidth);
                console.log("NEWSCROLL1=",newScroll);
                console.log("wildcard when scrolling right=",wildo)
            requestAnimationFrame(() => {
                container.scrollLeft = newScroll;
            });
            }
            // Scrolled to left
            else if (scrollLeft <= oneItemWidth) {
                const newScroll = oneItemWidth * trimmedTimeRange.length + wildCard;
            console.log("NEWSCROLL2=",newScroll)
            requestAnimationFrame(() => {
                container.scrollLeft = newScroll;
            });
            }
        };

        const debouncedScroll=debounce(detectScrollPoint,50)

        return function handler(event){
            debouncedScroll(event)
        }
    }

    const Detecthandler = detectDebounceHandler();

       

        //     const debouncedScroll = debounce(detectScrollPoint, 500);

        //     return function handler(event) {
        //       detectScrollPoint(event)
        //     };
       
        // const detecthandler = detectHorizontalScrollpointHandler(currentRef);\


      



    return(
        <div className="task-container mt-3">
            {isDummyPending&&(<PageLoading text="DELETING"/>)}
            {current.length===0&& !taskError.status?(
                <div className="task-error-message">
                    <h5>You currently have no Tasks</h5>
                    <button className="site_button">Add Task</button>
                </div>

            ):taskError.status&&current.length==0?(
                <div className="task-error-message">
                    <h5>Something went wrong</h5>
                    <button className="site_button">Try again</button>
                </div>

            ):(
                <div className="task-scroller mt-3 snap-x snap-mandatory smooth-scroll" ref={containerRef}>
                    {currentArr.map((item,index)=>(
                        <div className={centerIndex===index ?"item-center":current.length<3&& centerIndex!==index?"item-center":"item-beside"} key={index} >
                            <span className="period-span">{item.type}</span>
                            <div className="task-details">
                                <h4>{typeof(item.nextDate)==="string"?
                                formatDateWithOrdinal(item.nextDate).weekday:
                                formatDateWithOrdinal(getEarliestDate(item.nextDate)).weekday},
                                
                                {typeof(item.nextDate)==="string"?
                                formatDateWithOrdinal(item.nextDate).ordinalDate:
                                formatDateWithOrdinal(getEarliestDate(item.nextDate)).ordinalDate},</h4>

                                <h1>
                                    {typeof(item.nextDate)==="string"?
                                    `${formatDateWithOrdinal(item.nextDate).hour}:
                                    ${formatDateWithOrdinal(item.nextDate).min}`:
                                    `${formatDateWithOrdinal(getEarliestDate(item.nextDate)).hour}:
                                    ${formatDateWithOrdinal(getEarliestDate(item.nextDate)).min}`}
                                </h1>

                            </div>
                            <div className="description-details mt-4">
                                <p>{item.description}</p>
                            </div>
                            <div className="bottom-div">
                                {item.daysRepeated&&item.periodType==="daily"?(
                                    <div className="daysRepeat">
                                        {sortWeekdays(item.daysRepeated).map((thing,indexx)=>(
                                            <span key={indexx}>{thing}</span>
                                        ))}
                                    </div>
                                ):(
                                    <div></div>
                                )}
                                {centerIndex===index||(current.length<3&&centerIndex!==index)?(
                                    <ImBin onClick={(event)=>exUpdate(event,item)} className="delete-bin" size={innerWidth<500?15:20}/>
                                ):(
                                    null
                                )}

                            </div>
                            
                        </div>
                    ))}
                </div>

            )}
        </div>
    )

}