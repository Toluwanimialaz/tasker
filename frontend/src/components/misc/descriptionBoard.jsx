import { CgOptions } from "react-icons/cg";
import { Button } from "../ui/button";
import React,{ useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FaAngleRight } from "react-icons/fa";
import { LuListTodo } from "react-icons/lu";
import { Week } from "react-day-picker";
import { GiDuration } from "react-icons/gi";
import { useDispatch,useSelector } from "react-redux";


export default function DescriptionBoard({displayType,setDisplayType,periodType,setWeeksArr,positionSetter,setMonthDays,interval,periodLimter,setSelectedDays,selectedDays,description,setDescription,saveTask,googleReq,isPending}){

    const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    const[topic,setTopic]=useState("")
    const {isGoogleRefreshToken,provider}=useSelector((state)=>state.auth)
    
    const [rotated, setRotated] = useState(false);
    const [rotated2, setRotated2] = useState(false);
    const [weekday, setWeekdays] = React.useState([])
    const [weeks,setWeek]=useState("")
    // const [weeksArr,setWeeksArr]=useState([])
    const[weekPosition,setWeekPosition]=useState(1)
    const [showStatusBar, setShowStatusBar] = React.useState(true)
    const [showActivityBar, setShowActivityBar] = React.useState(false)
    const [showPanel, setShowPanel] = React.useState(false)


    const onWeekdayClick=(e,item)=>{
        console.log(e,item)
        setSelectedDays((prev)=>{
            console.log(prev)
          if(prev.includes(item)){
            return prev.filter(day=>day!==item)
          }else{
            return [...prev,item]
          }
        })
    }

    

    const selectWeek=(e,item)=>{
        console.log(e,item)
        setWeek(item)        
    }

    const saveToTable=()=>{
        const item=String(weekPosition);
        setMonthDays((prev)=>{
           const str=`${item==="1"?"1ST":item==="2"?"2ND":item==="3"?"3RD":"4TH"}${" "}${weeks.slice(0,2).toUpperCase()}` 
           return[...prev,str]
        })
        setWeeksArr((prev)=>{
            
            // const newObj={
            //     no:prev.length!==0?prev[prev.length-1].no+1:1,
            //     position:item==="1"?"1st":item==="2"?"2nd":item==="3"?"3rd":"4th",
            //     weekday:weeks,
            //     remove:true
                
            // }

            const newObj={
                position:item==="1"?"1st":item==="2"?"2nd":item==="3"?"3rd":"4th",
                weekday:weeks,
                remove:true
                
            }
            const exists = prev.some(obj =>
                Object.entries(newObj).every(([key, value]) => obj[key] === value)
            )
            if(!exists){
                return[...prev,newObj]
            }else{
                return prev
            }
        })
    }

    return(
        <div className="mt-3 mb-3" style={{width:"100%",display:"flex",justifyContent:"center"}}>
            <form className="description-board" >
                <div classname="board-flex">
                    <div className="editable-content-div">
                        <div className="editable topic-input" contentEditable="true" data-placeholder="Type topic..."
                          onInput={(e) => {
                            
                            const el = e.currentTarget
                            if (el.innerHTML === "<br>" || el.textContent.trim() === "") {
                              el.innerHTML = ""
                            }
                          }}
                        >
                           
                        </div>
                        <div className="editable description-input" contentEditable="true" data-placeholder="Description"
                          onInput={(e) => {
                            const el = e.currentTarget;
                            const text = el.textContent.trim();
                            if (el.innerHTML === "<br>" || text === "") {
                              el.innerHTML = "";
                            }
                            setDescription(text);
                          }}
                        >
                        </div>
                    </div>
                    <div className="editable-content-boxes">
                        <DropdownMenu
                            onOpenChange={() => {
                            setRotated2((prev) => !prev);
                            }}
                        >
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {displayType}
                                <span
                                className={`rotated-span ${rotated2 ? "rotated" : ""}`}
                                >
                                <FaAngleRight />
                                </span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Display Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                                value={displayType}
                                onValueChange={(e)=>{
                                    console.log(e)
                                    if(e==="period"){
                                        setDisplayType("period","oneTime")
                                    }else{
                                        setDisplayType("oneTime","period")
                                    }
                                }}
                            >
                                <DropdownMenuRadioItem value="period">
                                Period
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="oneTime">
                                OneTime
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">
                                    <GiDuration/>
                                    Set Interval
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="leading-none font-medium">Interval</h4>
                                    <p className="text-muted-foreground text-sm">
                                    Set the interval between your period type
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="width">Interval</Label>
                                    <Input
                                        id="width"
                                        defaultValue="2"
                                        className="col-span-2 h-8"
                                        value={interval}
                                        type="number"
                                        onChange={(e)=>periodLimter(e)}
                                    />
                                    </div>
                                </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <DropdownMenu
                            onOpenChange={() => {
                            setRotated((prev) => !prev);
                            }}
                        >
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {periodType}
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
                                value={periodType}
                                onValueChange={positionSetter}
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
                        

                        {displayType==="period"&&(
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <LuListTodo/>
                                        Set Weekdays
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Weekdays</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {days.map((item,key)=>(
                                        <DropdownMenuCheckboxItem key={key}
                                        onSelect={(e)=>e.preventDefault()}
                                        onClick={(e)=>onWeekdayClick(e,item)}
                                        checked={selectedDays.includes(item)}                                  >
                                            {displayType==="period"&&(periodType=="monthly"||periodType==="yearly")?`All${" "}${item}`:item}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {displayType==="period"&&(periodType==="yearly"||periodType==="monthly")&&(
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <CgOptions/>
                                        Repeat Option
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                        <h4 className="leading-none font-medium">Options</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Set the days in a month to be repeated
                                        </p>
                                        </div>
                                        <div className="grid gap-2">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label htmlFor="width">Week position</Label>
                                            <Input
                                            id="width"
                                            value={weekPosition}
                                            className="col-span-2 h-8"
                                            type="number"
                                            onChange={(e)=>{
                                                const input=e.target.value;
                                                if(input<=0 && input){
                                                    return setPeriodInterval((prev)=>prev)
                                                }
                                                if(input<=4){
                                                    setWeekPosition((prev)=>{
                                                        console.log(e.target.value)
                                                        return e.target.value
                                                
                                                    })
                                                }  
                                             
                                            }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label htmlFor="width">Week day</Label>
                                            <DropdownMenu 
                                            onOpenChange={() => {
                                                setRotated((prev) => !prev);
                                            }}
                                            >
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="customTable">
                                                        <span>weekdays</span>
                                                        <span
                                                        className={`rotated-span ${rotated ? "rotated" : ""}`}
                                                        >
                                                            <FaAngleRight />
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56">
                                                    <DropdownMenuLabel>weekdays</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {days.map((item,key)=>(
                                                        <DropdownMenuCheckboxItem key={key}
                                                        onCheckedChange={(e)=>selectWeek(e,item)}
                                                        checked={item===weeks}                                  >
                                                            {item}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            
                                           
                                        </div>
                                        <Button variant="custom1" onClick={saveToTable} disabled={!weekPosition||!weeks}>save</Button>
                              
                                        </div>
                                    </div>
                                    </PopoverContent>
                                </Popover>
                        )}

                    </div>
                    <hr/>
                    <div className="buttons-div">
                        <hr/>
                        {!isGoogleRefreshToken&&provider==="local"?(
                            <button className="google-calendar-button mb-5 mt-5" disabled={isPending} onClick={googleReq}>
                                <div className="calendar-flex">
                                <img height={10} width={40} src='/images/cal4.svg'/>
                                <span>connect Google calendar</span>
                                </div>
                            </button>
                        ):(
                            <Button size="md" variant="destructive"
                                onClick={(e)=>{
                                    e.preventDefault()
                                    saveTask()
                                }}
                                >Add Task
                            </Button>
                        )}
                    </div>

                </div>
            </form>

        </div>
    )
}