import { createSlice } from "@reduxjs/toolkit";


const initialState={
    user:{
        name:"",
        email:""
    },
    token:"",
    refreshToken:"",
    tokenExpiry:"",
    refreshTokenExpiry:"",
    displayPicture:"",
    isGoogleRefreshToken:false,
    provider:""
}

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        setToken:(state,{payload})=>{
            state.token=payload
        },
        setUser:(state,{payload})=>{
            state.user=payload
        },
        setRefreshToken:(state,{payload})=>{
            state.refreshToken=payload
        },
        setRefreshTokenExpiry:(state,{payload})=>{
            state.refreshTokenExpiry=payload
        },
        setTokenExpiry:(state,{payload})=>{
            state.tokenExpiry=payload
        },
        setDisplayPicture:(state,{payload})=>{
            state.displayPicture=payload
        },
        setIsGoogleRefreshToken:(state,{payload})=>{
            state.isGoogleRefreshToken=payload
        },
        setProvider:(state,{payload})=>{
            state.provider=payload
        },
        
    },
    extraReducers: (builder) => {},
})

export const {
    setToken,
    setUser,
    setRefreshToken,
    setRefreshTokenExpiry,
    setTokenExpiry,
    setDisplayPicture,
    setIsGoogleRefreshToken,
    setProvider
}=authSlice.actions


export default authSlice.reducer