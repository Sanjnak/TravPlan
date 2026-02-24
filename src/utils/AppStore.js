import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import tripReducer from "./tripSlice";
const AppStore = configureStore({
    reducer: {
        user: userReducer,
        trip: tripReducer,
    }
});

export default AppStore;