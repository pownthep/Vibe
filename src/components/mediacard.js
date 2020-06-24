import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  media: {
    width: 480,
    height: 270,
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
  customWidth: {
    width: 600,
  },
});

export default function MediaCard(props) {
  const classes = useStyles();
  const [checked] = useState(true);

  return (
    <Grow
      in={checked}
      timeout={props.timeout}
      className={classes.root}
      unmountOnExit
    >
        <Link to={"/watch/" + props.path}>
          <Paper className={classes.media} elevation={3}>
            <img
              className={classes.img}
              src={"http://localhost:9001/img/?url=" + props.image}
              alt="cover"
            />
          </Paper>
        </Link>
    </Grow>
  );
}
