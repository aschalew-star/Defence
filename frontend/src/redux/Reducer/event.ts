import { createReducer } from "@reduxjs/toolkit";
import { IEvent } from "../../types";

export interface EventState {
  isLoading: boolean;
  allEvents?: IEvent[];
  events?: IEvent[];
  event?: IEvent;
  error?: any;
  success?: boolean;
  message?: string;
}

const initialState: EventState = {
  isLoading: true,
  allEvents: [],
  events: [],
};

export const eventReducer = createReducer(initialState, (builder) => {
  builder.addCase("eventCreateRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("eventCreateSuccess", (state, action: any) => {
    state.isLoading = false;
    state.event = action.payload;
    state.success = true;
  });

  builder.addCase("eventCreateFail", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  });

  // get all events of shop
  builder.addCase("getAlleventsShopRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAlleventsShopSuccess", (state, action: any) => {
    state.isLoading = false;
    state.events = action.payload;
  });

  builder.addCase("getAlleventsShopFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // update event of a shop
  builder.addCase("updateEventRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("updateEventSuccess", (state, action: any) => {
    state.isLoading = false;
    state.event = action.payload;
    if (state.events) {
      state.events = state.events.map((ev) =>
        ev._id === action.payload._id ? action.payload : ev
      );
    }
  });

  builder.addCase("updateEventFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // delete event of a shop
  builder.addCase("deleteeventRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("deleteeventSuccess", (state, action: any) => {
    state.isLoading = false;
    state.message = action.payload;
  });

  builder.addCase("deleteeventFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // get all events
  builder.addCase("getAlleventsRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAlleventsSuccess", (state, action: any) => {
    state.isLoading = false;
    state.allEvents = action.payload;
  });

  builder.addCase("getAlleventsFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  builder.addCase("clearErrors", (state) => {
    state.error = null;
  });
});
