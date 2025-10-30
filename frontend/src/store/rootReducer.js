import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import authSlice from './authSlice/authslice'
import alertSlice from './alertSlice/alertSlice'
import taskSlice from './taskSlice/taskSlice'
import Storage from './storage'


const authPersistConfig={
    key:"auth",
    storage:Storage,
    // whitelist: ["authState"],
}

const taskPersistConfig={
    key:"task",
    storage:Storage,
    // whitelist: ["authState"],
}



const rootReducer=combineReducers({
    auth:persistReducer(authPersistConfig,authSlice),
    alert:alertSlice,
    task:persistReducer(taskPersistConfig,taskSlice)
})


export default rootReducer