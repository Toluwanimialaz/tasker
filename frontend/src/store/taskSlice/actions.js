import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAuth } from "@/utils/config/axios";
import { GETTASKS } from "@/utils/config/urlConfig";

export const getTasks=createAsyncThunk(
    "task/getTasks",
    async (payload, { getState, dispatch, rejectWithValue }) =>{
        try{

            const response=await axiosAuth(GETTASKS)
            console.log("TASK_RESPONSE",response)
            return response.data;
            

        }catch(error){
            console.log(error)
            rejectWithValue(error)
        }

    }
)