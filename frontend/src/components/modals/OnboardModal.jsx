import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOnboardingModal,
  setCustomAlertModal,
} from "../../store/alertSlice/alertSlice";
import { BiX, BiShow, BiHide } from "react-icons/bi";
import { axiosAuth } from "../../utils/config/axios";
import {
  GOOGLE_OAUTH,
  REQUEST_GOOGLE,
  SIGNUP,
} from "../../utils/config/urlConfig";
import { useLocation, useNavigate } from "react-router-dom";
// import { PageLoading } from "../loading/PageLoading";
import { setUser } from "../../store/authSlice/authslice";

export default function OnboardingModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { onBoardingModal: modal } = useSelector((state) => state.alert);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setEmailValidaity] = useState("");
  const [isNameValid, setNameValidaity] = useState("");
  const [badFields, setBadfields] = useState(true);
  const [messageVisible, setMessageVisible] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const callGoogle = async () => {
      const params = new URLSearchParams(location.search);
      console.log(location);
      const code = params.get("code");
      console.log("hello world");
      if (code) {
        setLoading(true)
        let payload = {
          Google_code: code,
          type:"signup"
        };
        try {
          const response = await axiosAuth.post(GOOGLE_OAUTH, payload);
          const responseData = response?.data;
          console.log(response);
          setLoading(false);
          if ([200, 201].includes(response?.status)) {
            dispatch(
              setCustomAlertModal({
                status: true,
                title: "Registration successful",
                message:responseData?.message,
                isChecked:true
              })
            );
            dispatch(setUser(responseData.data))
          } else {
            dispatch(
              setCustomAlertModal({
                status: true,
                title: responseData?.data?.error?.message || "error",
              })
            );
          }
        } catch (error) {
          console.log(error);
          console.log(loading);
          dispatch(
            setCustomAlertModal({
              status: true,
              message: error.response.data.error.message || "error during Sign up",
              title:"SignUp Error",
              type:"error",
              isChecked:true
            })
          );
        }finally{
          setLoading(false);
        }
      }
    };
    callGoogle();
  }, []);

  // useEffect(()=>{
  //     const timer= setTimeout(()=>{
  //         setMessageVisible(false)
  //     },5000)

  //     return ()=>{clearTimeout(timer)}
  // },[messageVisible])

  useEffect(() => {
    validate();
  }, [name, email, password, isNameValid, isEmailValid]);

  const closeModal = () => {
    // const params = new URLSearchParams(location.search);
    // const code = params.get("code");

    navigate("/")

    // if (!code) {
    //   navigate(-1);
    // } else {
    //   navigate("/");
    // }
  };

  const testClick=()=>{
    dispatch(
      setCustomAlertModal({
        status: true,
        title: "Registration successful",
        message:"registration successful, please check your email",
        isChecked:true
      })
    );
  }

  const googleSignup = async (e) => {
    const type="signup"
    e.preventDefault();
    const response = await axiosAuth.get(REQUEST_GOOGLE,{
        params:{type}
    });
    console.log(response);
    window.location.href = response.data.url;
  };

  const validate = () => {
    if (name === "" || email === "" || password === "") {
      setBadfields(true);
      return;
    }

    if (name !== "" && isNameValid !== "") {
      setBadfields(true);
      return;
    }

    if (email && isEmailValid !== "") {
      setBadfields(true);
      return;
    }

    if (password === "") {
      setBadfields(true);
    }

    setBadfields(false);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true)
    let payload = {
      username: name,
      email: email,
      password: password,
    };

    try {
      const response = await axiosAuth.post(SIGNUP, payload);
      const responseData=response.data;
      setLoading(false)
      if ([200, 201].includes(response?.status)) {
        dispatch(
          setCustomAlertModal({
            status: true,
            title: "Registration successful",
            isChecked:true,
            type:"success",
            message:response.data.message
          })
        );
        dispatch(setUser(responseData.data))

      } else {
        dispatch(
          setCustomAlertModal({
            status: true,
            title: "error",
            isChecked:true
          })
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        setCustomAlertModal({
          status: true,
          title: "error",
          isChecked:true
        })
      );
    }finally{
      setLoading(false)
    }
  };


  return (
    <>
        <div className="alert-modal">
          <div
            className="alert-modal-overlay"
            onClick={() => closeModal()}
          ></div>
          <div className="alert-modal-card animate-bounce">
            <div className="close-modal">
              <BiX size={29} onClick={() => closeModal()} />
            </div>
            <div className="alert-modal-body">
              <div
                className="text-center w-100"
                style={{ textAlign: "center" }}
              >
                <h4>Sign Up</h4>
                {/* <div className={messageVisible?"fade-in":"fade-out"}>
                            {messageVisible&& <span >Registration successful</span>} 
                        </div> */}
                {loading&&
                  <div style={{display:"flex",flexDirection:"row",justifyContent:"center",gap:"10px"}}>
                    <span>
                      Please Wait
                    </span>
                    <div className="ellipsis-loader">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                }
              </div>
              <form className="form" onSubmit={submitForm}>
                <div className="form-group">
                  <label onClick={()=>{testClick()}}>Name</label>
                  <input
                    onChange={(e) => {
                      if(e.target.value!==""){
                        const Namepattern = /^(?!\s*$)[\p{L}\s]+$/u;
                        console.log(Namepattern.test(e.target.value))
                        if (Namepattern.test(e.target.value)) {
                          setName(e.target.value);
                          setNameValidaity("");
                        } else {
                          setNameValidaity(
                            "name cannot contain numbers or symbols"
                          );
                        }
                      }else{
                        setName("")
                        setNameValidaity("")
                      }
                    }}
                    type="text"
                  />
                  <span className="validity">{isNameValid}</span>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    onChange={(event) => {
                      const email = event.target.value;
                      setEmail(email);
                      const emailPattern =
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                      if (!emailPattern.test(email) && email !== "") {
                        setEmailValidaity("Enter a valid email address");
                      } else {
                        setEmailValidaity("");
                      }
                    }}
                    type="text"
                  />
                  <span className="validity">{isEmailValid}</span>
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-div">
                    <input
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      type={isPasswordVisible ? "text" : "password"}
                    />
                    {isPasswordVisible ? (
                      <div
                        className="showHide"
                        onClick={() => {
                          setIsPasswordVisible(!isPasswordVisible);
                        }}
                      >
                        <BiShow size={20} color={"#222"} />
                      </div>
                    ) : (
                      <div
                        className="showHide"
                        onClick={() => {
                          setIsPasswordVisible(!isPasswordVisible);
                        }}
                      >
                        <BiHide size={20} color={"#222"} />
                      </div>
                    )}
                  </div>
                  <div className="flex_row mt-4">
                    <button
                      disabled={badFields}
                      className="site_button"
                      style={{ width: "70%" }}
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                  <div className="flex_row">
                    <div
                      className="google_button mt-3"
                      onClick={(e) => {
                        googleSignup(e);
                      }}
                    >
                      <a>
                        <img
                          src="./images/googlee.jpg"
                          height="20px"
                          width="20px"
                        />
                        <span>Sign up with google</span>
                      </a>
                    </div>
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <span>
                      Already have an account?Login
                      <span
                        style={{ textDecoration: "underline", color: "gray",cursor:"pointer" }}
                      >
                        <a onClick={()=>navigate("/login")}> here </a>
                      </span>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
    </>
  );
}
