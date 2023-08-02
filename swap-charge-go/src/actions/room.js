import fetchData from "./utils/fetchData";

const url = process.env.REACT_APP_SERVER_URL + "/room";

export const createRoom = async (room, currentUser, dispatch, setPage) => {
  dispatch({ type: "START_LOADING" });

  const result = await fetchData(
    { url, body: room, token: currentUser?.token },
    dispatch
  );
  if (result) {
    dispatch({
      type: "UPDATE_ALERT",
      payload: {
        open: true,
        severity: "success",
        message: "The room has been added successfully",
      },
    });
    dispatch({ type: "RESET_ROOM" });
    setPage(0);
    dispatch({ type: "UPDATE_ROOM", payload: result });
  }

  dispatch({ type: "END_LOADING" });
};

export const getRooms = async (dispatch) => {
  const result = await fetchData({ url, method: "GET" }, dispatch);
  if (result) {
    dispatch({ type: "UPDATE_ROOMS", payload: result });
  }
};

// Action type for incrementing the slots value
const INCREMENT_SLOTS = "INCREMENT_SLOTS";

// Action creator function for incrementing the slots value
export const incrementSlots = () => ({
  type: INCREMENT_SLOTS,
});

export const handleButtonClick = async (room, currentUser, dispatch) => {
  // Check if room exists
  if (!room) return;

  // Access the slots and maxSlots values from the room object
  let slots = room.slots;
  const maxSlots = room.maxSlots;
  const nextIncrementTime = room.nextIncrementTime; //...

  // If slots is greater than 0, decrement it by one
  if (slots > 0) {
    // Dispatch the action to update the room state in the context immediately
    const updatedRoom = { ...room, slots: slots - 1 };
    dispatch({ type: "UPDATE_ROOM", payload: updatedRoom });

    try {
      // Make an API call to update the slots value on the server
      const result = await fetchData(
        {
          url: `${url}/${room._id}`,
          method: "PUT",
          body: { slots: updatedRoom.slots },
          token: currentUser?.token,
        },
        dispatch
      );

      if (result.success) {
      } else {
        // Handle any error that occurred during the API call if needed
      }
    } catch (error) {
      // Handle any error that occurred during the API call if needed
    }
  }

  // ... Any other logic you want to perform with the updated slots value ...
};
