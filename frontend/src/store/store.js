import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import rootReducer from "./rootReducer";




export const Store=configureStore({
    reducer:rootReducer,
    devTools: import.meta.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
})

export const persistor=persistStore(Store)