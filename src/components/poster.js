import React from "react";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";
import { makeStyles } from "@material-ui/core/styles";
import { toDataURL } from "../utils/utils";

const useStyles = makeStyles({
  media: {
    width: 185,
    height: 265,
    borderRadius: 4,
    marginRight: 10,
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "inherit",
    objectFit: "cover",
    borderRadius: 4,
  },
});

export default function Poster({ image, name }) {
  const [checked] = React.useState(true);
  const classes = useStyles();
  return (
    <Grow in={checked} timeout={800} className={classes.media} unmountOnExit>
      <div>
        <img
          className={classes.img}
          src={
            window.desktop ? "http://localhost:9001/img/?url=" + image : image
          }
          alt={name}
          onError={(e) => (e.target.src = image)}
        />
        <Typography variant="button" display="block" gutterBottom noWrap={true}>
          {name}
        </Typography>
      </div>
    </Grow>
  );
}
