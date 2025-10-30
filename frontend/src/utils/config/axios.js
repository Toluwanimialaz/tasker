"use strict"
import axios from "axios"
import {Store} from "../../store/store"
import { RenewAccessToken } from "../hooks/getToken"
import { setToken,setTokenExpiry } from "../../store/authSlice/authslice"



const BASEURL=import.meta.env.VITE_API_URL

let headers={
    "Content-type":"application/json",
    Authorization:""
}

const axiosInstance=axios.create({
    baseURL:BASEURL,
    headers
})


export default axiosInstance

export const axiosAuth=axios.create({
    baseURL:BASEURL,
    headers:{"Content-Type":"application/json"}
})


axiosAuth.interceptors.request.use(
    (config)=>{
        let localStorageAuth=localStorage.getItem("persist:auth");
        const localToken=localStorageAuth
            ?JSON.parse(localStorageAuth)?.token?.replace(/"/g, "")
            :""
        
        let storeToken = Store.getState()?.auth?.token;
        const token = storeToken ? storeToken : localToken;

        if(token){
            config.headers.Authorization=`Bearer ${token}`
        }

        return config
    },
    async(error)=>{
        return Promise.reject(error)
    }
)

axiosAuth.interceptors.response.use(
    (response)=>{
        
        return response
    },

    async(error)=>{
        const originalRequest= error.config;
        if(error.response.status===401){
            originalRequest._retry=true;
            const accessObject=await RenewAccessToken()
            if (accessObject?.accessToken) {
                axios.defaults.headers.common["Authorization"] =
                  "Bearer " + accessObject?.accessToken;
        
                Store.dispatch(setToken(accessObject?.accessToken));
                Store.dispatch(setTokenExpiry(accessObject?.accessExpiry));
                return axiosAuth(originalRequest);
            } else {
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
)

