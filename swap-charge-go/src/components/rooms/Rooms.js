import {
  Avatar,
  Card,
  ButtonBase,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
} from "@mui/material";
import { useValue } from "../../context/ContextProvider";

const Rooms = () => {
  const {
    state: { filteredRooms },
    dispatch,
  } = useValue();
  return (
    <Container sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
      <ImageList
        gap={12}
        sx={{
          mb: 10,
          gap: { xs: 2, sm: 2.5 },
          gridTemplateColumns:
            "repeat(auto-fill, minmax(280px, 1fr))!important",
        }}
      >
        {filteredRooms.map((room) => (
          <Card
            key={room._id}
            sx={{
              height: "100%",
              transition: "border-color 160ms ease, transform 160ms ease",
              "&:hover": { borderColor: "rgba(128, 185, 77, 0.55)", transform: "translateY(-2px)" },
              "&:focus-within": { borderColor: "secondary.main" },
            }}
          >
            <ImageListItem sx={{ height: "100% !important", overflow: "hidden" }}>
              <ImageListItemBar
                sx={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.7)0%, rgba(0,0,0,0.3)70%, rgba(0,0,0,0)100%)",
                }}
                title={room.price === 0 ? "Free with Subscription" : "$" + room.price}
                actionIcon={
                  <Tooltip title={room.uName} sx={{ mr: "5px" }}>
                    <Avatar src={room.uPhoto} />
                  </Tooltip>
                }
                position="top"
              />
              <ButtonBase
                component="button"
                aria-label={`View ${room.title} station details`}
                onClick={() => dispatch({ type: "UPDATE_ROOM", payload: room })}
                sx={{ display: "block", width: "100%", textAlign: "left" }}
              >
                <img
                  src={room.images[0]}
                  alt={room.title}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                  }}
                />
              </ButtonBase>
              <ImageListItemBar
                title={room.title}
                subtitle={room.description}
                sx={{
                  background: "linear-gradient(0deg, rgba(16, 23, 22, 0.94), rgba(16, 23, 22, 0.62))",
                  "& .MuiImageListItemBar-title": { fontWeight: 700 },
                  "& .MuiImageListItemBar-subtitle": { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
                }}
              />
            </ImageListItem>
          </Card>
        ))}
      </ImageList>
    </Container>
  );
};

export default Rooms;
