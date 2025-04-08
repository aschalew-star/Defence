import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const eventReducer = createReducer(initialState,(builder)=>{
 builder.addCase("eventCreateRequest", (state) => {
    state.isLoading = true;
  })   

  builder.addCase("eventCreateSuccess",(state, action) => {
    state.isLoading = false;
    state.event = action.payload;
    state.success = true;
  })

  builder.addCase("eventCreateFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },)
  


  // get all events of shop
  builder.addCase("getAlleventsShopRequest", (state) => {
    state.isLoading = true;
  })

  builder.addCase("getAlleventsShopSuccess", (state, action) => {
    state.isLoading = false;
    state.events = action.payload;
  })
  
  builder.addCase("getAlleventsShopFailed", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  })


  // delete event of a shop

  builder.addCase("deleteeventRequest",(state) => {
    state.isLoading = true;
  })
 
  builder.addCase("deleteeventSuccess",(state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  })

  builder.addCase("deleteeventFailed", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  })
 

  // get all events 
  builder.addCase("getAlleventsRequest",  (state) => {
    state.isLoading = true;
  })
 
  builder.addCase("getAlleventsSuccess",  (state, action) => {
    state.isLoading = false;
    state.allEvents = action.payload;
  })
 
   
  builder.addCase("getAlleventsFailed", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  })
 

   
  builder.addCase("clearErrors",  (state) => {
    state.error = null;
  })
 
});
