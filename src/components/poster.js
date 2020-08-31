import React from "react";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";
import { makeStyles } from "@material-ui/core/styles";
import { getLink, toDataURL } from "../utils/utils";
import http from 'tauri/api/http'

const useStyles = makeStyles({
  media: {
    width: 180,
    height: 265,
    borderRadius: 4,
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
          src={getLink(image)}
          alt={name}
        />
        <Typography display="block" gutterBottom noWrap={true} style={{textAlign: 'center'}}>
          {name}
        </Typography>
      </div>
    </Grow>
  );
}
