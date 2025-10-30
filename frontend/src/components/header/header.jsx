import React from "react";
import { BiMenu } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { setShowSideMenu,setOnboardingModal } from "../../store/alertSlice/alertSlice";
import { useNavigate,useLocation } from "react-router-dom";


export default function Header({scrolled}) {
    const dispatch=useDispatch()
    const navigate = useNavigate();
    const location = useLocation();
    const {user,token} = useSelector((state) => state.auth);
    const {onBoardingModal,showSideMenu} = useSelector((state) => state.alert);
    const openSignup = () => {
        navigate("/signup", { state: { backgroundLocation: location } });
    };

    const openSideBarMenu=()=>{
        dispatch(setShowSideMenu({
            status:true
        }))
        
    }
    return(
        <>
          <header className={`header ${scrolled?"":"scroller"}`}>  
            <nav>
                <h1></h1>
                {token===""?(
                    <div>
                        <button 
                         onClick={()=>{
                            openSignup()
                         }}
                        >
                            Sign Up
                        </button>
                    </div>
                ):(
                    <div className="hamburger" onClick={openSideBarMenu}>
                        <BiMenu size={30}/>
                    </div>
                )}
            </nav>
          </header>
        </>
    )
}