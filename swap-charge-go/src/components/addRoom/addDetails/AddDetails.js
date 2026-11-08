import {
  FormControl,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useValue } from "../../../context/ContextProvider";
import InfoField from "./InfoField";

const AddDetails = () => {
  const {
    state: {
      details: { title, description, price, totalSlots },
    },
    dispatch,
  } = useValue();
  const [costType, setCostType] = useState(price ? 1 : 0);
  const [capacityTouched, setCapacityTouched] = useState(false);
  const capacityText = String(totalSlots ?? "");
  const capacityValue = Number(capacityText);
  const capacityValid =
    /^\d+$/.test(capacityText) &&
    Number.isInteger(capacityValue) &&
    capacityValue >= 1 &&
    capacityValue <= 500;
  const handleCostTypeChange = (e) => {
    const costType = Number(e.target.value);
    setCostType(costType);
    if (costType === 0) {
      dispatch({ type: "UPDATE_DETAILS", payload: { price: 0 } });
    } else {
      dispatch({ type: "UPDATE_DETAILS", payload: { price: 15 } });
    }
  };
  const handlePriceChange = (e) => {
    dispatch({ type: "UPDATE_DETAILS", payload: { price: e.target.value } });
  };
  return (
    <Stack
      sx={{
        alignItems: "center",
        "& .MuiTextField-root": { width: "100%", maxWidth: 500, m: 1 },
      }}
    >
      <FormControl>
        <RadioGroup
          name="costType"
          value={costType}
          row
          onChange={handleCostTypeChange}
        >
          <FormControlLabel value={0} control={<Radio />} label="Free with Subscription" />
          <FormControlLabel value={1} control={<Radio />} label="Nominal Fee" />
          {Boolean(costType) && (
            <TextField
              sx={{ width: "7ch !important" }}
              variant="standard"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              inputProps={{ type: "number", min: 1, max: 50 }}
              value={price}
              onChange={handlePriceChange}
              name="price"
            />
          )}
        </RadioGroup>
      </FormControl>
      <InfoField
        mainProps={{ name: "title", label: "Title", value: title }}
        minLength={5}
      />
      <TextField
        name="totalSlots"
        label="Total station capacity"
        type="number"
        required
        value={totalSlots}
        onChange={(event) => {
          setCapacityTouched(true);
          dispatch({
            type: "UPDATE_DETAILS",
            payload: { totalSlots: event.target.value },
          });
        }}
        inputProps={{ min: 1, max: 500, step: 1, inputMode: "numeric" }}
        error={capacityTouched && !capacityValid}
        helperText={
          capacityTouched && !capacityValid
            ? "Enter a whole number from 1 to 500."
            : "Required for booking availability (1-500 slots)."
        }
        variant="outlined"
      />
      <InfoField
        mainProps={{
          name: "description",
          label: "Description",
          value: description,
        }}
        minLength={10}
        optionalProps={{ multiline: true, rows: 4 }}
      />
    </Stack>
  );
};

export default AddDetails;
