import axios from "axios";
import { Dispatch } from "redux";
import { server } from "../../server";

// create event
export const createevent = (eventData: any) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: "eventCreateRequest",
    });

    const { data } = await axios.post(`${server}/event/create-event`, eventData, {
      withCredentials: true,
    });

    dispatch({
      type: "eventCreateSuccess",
      payload: data.event,
    });
  } catch (error: any) {
    dispatch({
      type: "eventCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all events of a shop
export const getAllEventsShop = (id: string) => async (dispatch: Dispatch) => {
  if (!id) return;
  try {
    dispatch({
      type: "getAlleventsShopRequest",
    });

    const { data } = await axios.get(`${server}/event/get-all-events/${id}`);
    dispatch({
      type: "getAlleventsShopSuccess",
      payload: data.events,
    });
  } catch (error: any) {
    dispatch({
      type: "getAlleventsShopFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// update event of a shop
export const updateEvent = (id: string, eventData: any) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: "updateEventRequest",
    });

    const { data } = await axios.put(
      `${server}/event/update-event/${id}`,
      eventData,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "updateEventSuccess",
      payload: data.event,
    });
    return data;
  } catch (error: any) {
    dispatch({
      type: "updateEventFailed",
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// delete event of a shop
export const deleteEvent = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: "deleteeventRequest",
    });

    const { data } = await axios.delete(
      `${server}/event/delete-shop-event/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteeventSuccess",
      payload: data.message,
    });
  } catch (error: any) {
    dispatch({
      type: "deleteeventFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all events
export const getAllEvents = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: "getAlleventsRequest",
    });

    const { data } = await axios.get(`${server}/event/get-all-events`);
    dispatch({
      type: "getAlleventsSuccess",
      payload: data.events,
    });
  } catch (error: any) {
    dispatch({
      type: "getAlleventsFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};
