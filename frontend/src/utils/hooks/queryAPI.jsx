import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosAuth } from "../config/axios"


const backendRoute=import.meta.env.VITE_API_URL;
export const useFetchQuery=(key)=>{ 
    const {data,isLoading,error,isError}=useQuery({
        queryFn:async(url)=>{
            const response=await axiosAuth.get(url);
            return response.data

        },
        queryKey:[key]
    })

    return {data,isLoading,error,isError}

}

export const MutateQuery=(url,invalidateKey='')=>{
    const queryClient=useQueryClient()
    return useMutation({
        mutationFn:async (param)=>{
            // await new Promise((resolve)=>setTimeout(resolve,5000))
            const response=await axiosAuth.post(url,param);
            return response.data
        },
        onSuccess:()=>{
            if(invalidateKey){
                queryClient.invalidateQueries([invalidateKey])
            }
        }
    })

}

export const MutateGetQuery=(baseUrl,invalidateKey='')=>{
    const queryClient=useQueryClient()
    return useMutation({
        mutationFn:async (params={})=>{
            const url=new URL(baseUrl,backendRoute)
            console.log(url)
            Object.entries(params).forEach(([key,value])=>{
                if (value !== undefined && value !== null){
                    url.searchParams.append(key,value)
                    console.log(url.searchParams.append(key,value))
                }
            })
            // await new Promise((resolve)=>setTimeout(resolve,5000))
            const response=await axiosAuth.get(baseUrl);
            return response.data
        },
        onSuccess:()=>{
            if(invalidateKey){
                queryClient.invalidateQueries([invalidateKey])
            }
        }
    })

}