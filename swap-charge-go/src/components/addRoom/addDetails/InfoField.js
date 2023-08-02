import { Avatar, InputAdornment, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useValue } from "../../../context/ContextProvider";
import pendingIcon from "./icons/progress1.svg";
import { Check } from "@mui/icons-material";

let timer;
const InfoField = ({ mainProps, optionalProps = {}, minLength }) => {
  const { dispatch } = useValue();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    dispatch({
      type: "UPDATE_DETAILS",
      payload: { [e.target.name]: inputValue },
    });
    if (!editing) setEditing(true);
    clearTimeout(timer);
    timer = setTimeout(() => {
      setEditing(false);
      validateInput(inputValue);
    }, 1000);
  };

  const validateInput = (value) => {
    // For slots input, check if the value is a valid number and not less than 50
    if (mainProps.name === "slots") {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue) || parsedValue < 50) {
        setError(true);
        setSuccess(false);
      } else {
        setError(false);
        setSuccess(true);
      }
    } else {
      // For other inputs, check the length as before
      if (value.length < minLength) {
        setError(true);
        setSuccess(false);
      } else {
        setError(false);
        setSuccess(true);
      }
    }
  };

  useEffect(() => {
    validateInput(mainProps.value);
  }, [mainProps.value]);

  return (
    <TextField
      {...mainProps}
      {...optionalProps}
      error={error}
      // Display specific helperText for slots input, and minLength validation for other fields
      helperText={
        error
          ? mainProps.name === "slots"
            ? "The number of slots must be at least 50"
            : `This field must be ${minLength} characters or more`
          : ""
      }
      color={success ? "success" : "primary"}
      variant="outlined"
      onChange={handleChange}
      required
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {editing ? (
              <Avatar src={pendingIcon} sx={{ height: 70 }} />
            ) : (
              success && <Check color="success" />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default InfoField;
