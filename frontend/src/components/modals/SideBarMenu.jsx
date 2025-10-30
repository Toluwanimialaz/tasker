import { setShowSideMenu } from "../../store/alertSlice/alertSlice";
import { handleAllLogout } from "@/utils/helpers/pureFunctions";
import { useDispatch, useSelector } from "react-redux";
import { BiX, BiError } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useEffect,useState } from "react";
import { AiFillCalendar } from "react-icons/ai";
import { FaHourglassHalf } from "react-icons/fa";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { GiBullseye } from "react-icons/gi";

export const SideBarMenu = () => {

  const navItems=[
    {
        title:"Task Manager",
        menu:["Scheduler/Dealines","Recurring Tasks"],
        hasDropDown:true,
        type:"tasks"
    },
    {
        title:"Habits",
        menu:["Habit Tracker","Streaks","Suggestions"],
        hasDropDown:true,
        type:"habits"
    },    
    {
        title:"Analytics",
        hasDropDown:false,
        type:"analytics"
    },    
    {
        title:"Goals",
        menu:["Progress","Milestones & Targets"],
        hasDropDown:true,
        type:"goals"
    },   
    // {
    //     title:"tasks",
    //     menu:["schedule a task","task analytics"],
    //     hasDropDown:false
    // },    
    // {
    //     title:"tasks",
    //     menu:["schedule a task","task analytics"],
    //     hasDropDown:false
    // },
  ]
  const dispatch = useDispatch();
  const { showSideMenu: menu } = useSelector((state) => state.alert);
  const {displayPicture,user } = useSelector((state) => state.auth);
  const[dropIndex,setDropIndex]=useState(null)

  const closeModal = () => {
    console.log("close modal");
    console.log(menu);
    dispatch(
      setShowSideMenu({
        status: false,
      })
    );
  };

  const toggleMenu=(index)=>{
    setDropIndex((prev)=>{
        if(prev===index){
            return null
        }

        return index
    })
  }

  const logoSelector=(item)=>{
    switch(item.type){
        case "tasks":
            return <AiFillCalendar />
        case "habits":
            return <FaHourglassHalf/>
        case "analytics":
            return <TbBrandGoogleAnalytics/>
        default:
            return <GiBullseye/>
    }
  }

  return (
    menu.status && (
      <div className="alert-modal" >
        <div className="alert-modal-overlay2" onClick={() => closeModal()}></div>

        <div className="sideBar" >
          <div className="close-modal">
            <BiX size={29} onClick={() => closeModal()} />
          </div>
          <div className="sidebar-content">
            <div className="profile-div">
                <div className="logo">
                    {!displayPicture?(
                        <img src="./images/default.png"/>
                    ):(
                        <img src={displayPicture} />
                    )}
                </div>
                <div className="logo-text">
                    <p>{user.name}</p>
                    <span>{user.email}</span>
                </div>

            </div>
            <div className="parent-nav">
                <nav className="menu">
                <>
                    {navItems.map((item,index)=>(
                        <div className="column-display" key={index}>
                            <div className="logo-flex"
                                onClick={(e)=>{
                                    e.stopPropagation()
                                    toggleMenu(index)
                                }}
                            >
                                <div style={{display:"flex",flexDirection:"row",alignItems:"center",gap:"10px"}}>
                                    {logoSelector(item)}
                                    <a>{item.title}</a>
                                </div>
                                {item.hasDropDown&&(
                                    <span
                                    className={`arrow ${dropIndex === index ? "open" : ""}`}
                                    >
                                        ▼
                                    </span>
                                )}
                                
                                
                            </div> 
                            {item.hasDropDown&&(
                                <nav className={`submenu ${dropIndex===index?"opened":""}`}>
                                    {item.menu.map((sub,idx)=>(
                                        <div  key={idx} className="submenu-dropdown">
                                            <span className="thick-dot"></span>
                                            <a>{sub}</a>
                                        </div>
                                    ))}
                                </nav>
                            )}
                        </div>
                    ))}

                </>
                </nav>
            </div>
            <div style={{textAlign:"right",width:"100%",padding:"0px 5px",cursor:"pointer"}}
             onClick={()=>{handleAllLogout()}}
            >
                Log out
            </div>
          </div>
        </div>
      </div>
    )
  );
};
