
import rootSlice from "./rootSlice";

import { configureStore, combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
    root: rootSlice,
    });

const store = configureStore({
    reducer: rootReducer,
});

export default store;