import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import stringHash from "string-hash";
const useStyles = makeStyles({
  media: {
    width: "99%",
    height: 350,
    borderRadius: 4,
    margin: 3,
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "inherit",
    objectFit: "cover",
    borderRadius: 4,
  },
});

export default function MediaCard({ image, name }) {
  const classes = useStyles();
  const [checked] = useState(true);

  return (
    <Grow in={checked} timeout={800} className={classes.media} unmountOnExit>
      <Paper elevation={3}>
        <img
          className={classes.img}
          src={window.directory + "/server/img/" + stringHash(image)}
          alt={name}
          onError={(e) =>
            (e.target.src = "http://localhost:9001/img/?url=" + image)
          }
        />
      </Paper>
    </Grow>
  );
}
