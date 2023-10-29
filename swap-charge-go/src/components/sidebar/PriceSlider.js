import { Box, Slider, Typography } from "@mui/material";
import React from "react";
import { useValue } from "../../context/ContextProvider";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const marks = [
  { value: 0, label: "$0" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#000000',
    },
  },
});

const PriceSlider = () => {
  const {
    state: { priceFilter },
    dispatch,
  } = useValue();
  return (
    <Box sx={{ mt: 5 }}>
      <Typography>Max Price: {"$ " + priceFilter}</Typography>
      <ThemeProvider theme={darkTheme}>
      <Slider
        min={0}
        max={50}
        defaultValue={50}
        valueLabelDisplay="auto"
        marks={marks}
        value={priceFilter}
        onChange={(e, price) =>
          dispatch({ type: "FILTER_PRICE", payload: price })
        }
      />
     </ThemeProvider>
    </Box>
  );
};

export default PriceSlider;
