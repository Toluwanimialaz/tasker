import { createSlice } from "@reduxjs/toolkit";
import { getTasks } from "./actions";


const initialState={
    currentTasks:[],
    expiredTasks:[],
    taskLoading:false,
    taskError:{
        status:false,
        message:""

    }

}

const taskSlice=createSlice({
    name:"task",
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder.addCase(getTasks.pending,(state, {payload})=>{
            state.taskLoading=true;
            state.taskError={
                status:false,
                message:""
            }
        });
        builder.addCase(getTasks.fulfilled,(state,action)=>{
            state.taskLoading=false;
            state.taskError={
                status:false,
                message:""
            };
            let data=action.payload;
            console.log(data)
            if(data){
                state.currentTasks=data?.data?.current;
                state.expiredTasks=data?.data?.expired;
            }
        });
        builder.addCase(getTasks.rejected, (state, action) => {
            state.taskLoading = false;
            state.taskError = {
              status: true,
              message: "Error occured",
            };
            state.currentTasks = [];
            state.expiredTasks=[]      
        });

    }

})






export default taskSlice.reducer