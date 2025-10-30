import { createSlice } from "@reduxjs/toolkit";


const initialState={
    showSideMenu:{
        status:false
    },
    CustomAlertModal:{
        title:'',
        type:"",
        status:false,
        message:"",
        isChecked:false
    },
    deleteModal:{
        status:false,
        message:"",
        title:"How do you want to delete your events",
        payload:null
    },
    verificationModal:{
        title:"Enter your code",
        status:true,
    },
    alertFlash:{
        status:false,
        message:"",
        type:""
    },
    loginModal:{
        status:false,
    },
    descriptionModal:{
        status:false,
        title:"",
        payload:null
    }
}

const alertSlice=createSlice({
    name:"alert",
    initialState,
    reducers:{
        setShowSideMenu:(state,{payload})=>{
            state.showSideMenu=payload
        },
        setOnboardingModal:(state,{payload})=>{
            state.onBoardingModal=payload
        },
        setCustomAlertModal:(state,{payload})=>{
            state.CustomAlertModal=payload
        },
        setVerificationModal:(state,{payload})=>{
            state.verificationModal=payload
        },
        setAlertFlash:(state,{payload})=>{
            state.alertFlash=payload
        },
        setLoginModal:(state,{payload})=>{
            state.loginModal=payload
        },
        setDescriptionModal:(state,{payload})=>{
            state.descriptionModal=payload
        },
        setDeleteModal:(state,{payload})=>{
            state.deleteModal=payload
        },
    },
    extraReducers: (builder) => {},
})

export const {
    setShowSideMenu,
    setOnboardingModal,
    setCustomAlertModal,
    setVerificationModal,
    setAlertFlash,
    setLoginModal,
    setDescriptionModal,
    setDeleteModal
}=alertSlice.actions


export default alertSlice.reducer