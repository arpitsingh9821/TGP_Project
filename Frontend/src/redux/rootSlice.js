import { createSlice } from "@reduxjs/toolkit";
// import { act } from "react";

const rootSlice = createSlice({
    name: 'root',
    initialState: {
        loading: true,
        portfolio: null, 
        reloadData: false
    },
    reducers: {
        ShowLoading: (state) => {
            state.loading = true;
        },
        HideLoading: (state) => {
            state.loading = false;  
        },
        SetPortfolioData: (state, action) => {
            state.portfolio = action.payload;
        },
        ReloadData: (state, action) => {
            state.reloadData = action.payload;
        }
    },
});
export const { ShowLoading, HideLoading, SetPortfolioData, ReloadData} = rootSlice.actions;
export default rootSlice.reducer;
