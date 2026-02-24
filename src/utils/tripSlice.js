import { createSlice } from "@reduxjs/toolkit";

const tripSlice = createSlice({
    name: "trip",
    // store array of trips so components can show lists
    initialState: [],
    reducers: {
        setTrips: (state, action) => {
            return action.payload;
        },
        addTrip: (state, action) => {
            return [...state, action.payload];
        },
        removeTrip: (state, action) => {
            // action.payload is expected to be the trip id
            return state.filter((t) => t.id !== action.payload);
        }
    }
});

export const {setTrips, addTrip, removeTrip} = tripSlice.actions;
export default tripSlice.reducer;