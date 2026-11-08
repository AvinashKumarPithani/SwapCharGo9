import { Box, Slider, Typography } from "@mui/material";
import React from "react";
import { useValue } from "../../context/ContextProvider";

const marks = [
  { value: 0, label: "$0" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
];

const PriceSlider = () => {
  const {
    state: { priceFilter },
    dispatch,
  } = useValue();
  return (
    <Box sx={{ mt: 3, p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="subtitle2" fontWeight={700}>
        Maximum price <Box component="span" sx={{ color: "secondary.main", ml: 0.5 }}>${priceFilter}</Box>
      </Typography>
      <Slider
        min={0}
        max={50}
        defaultValue={50}
        valueLabelDisplay="auto"
        marks={marks}
        value={priceFilter}
        aria-label="Maximum station price"
        onChange={(e, price) =>
          dispatch({ type: "FILTER_PRICE", payload: price })
        }
      />
    </Box>
  );
};

export default PriceSlider;
