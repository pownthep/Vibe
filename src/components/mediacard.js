import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from "@material-ui/core/Chip";
import SentimentSatisfiedAltIcon from "@material-ui/icons/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
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
      {/* <Tooltip
        placement="right-start"
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 300 }}
        title={
          <TooltipContent
            desc={props.description}
            keywords={props.keywords}
            title={props.title}
            rating={props.rating}
            poster={props.poster}
          />
        }
        classes={{ tooltip: classes.customWidth }}
      > */}
        <Link to={"/watch/" + props.path}>
          <Paper className={classes.media} elevation={3}>
            <img
              className={classes.img}
              src={"http://localhost:9001/img/?url=" + props.image}
            />
          </Paper>
        </Link>
      {/* </Tooltip> */}
    </Grow>
  );
}

function TooltipContent(props) {
  return (
    <div style={{ position: "relative" }}>
      <div>
        <Typography style={{ margin: 1, width: "100%" }}>
          {props.title}
        </Typography>
        {props.keywords.split(",").map((keyword) => (
          <Chip key={keyword + "-chip"} label={keyword} style={{ margin: 1 }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, right: 5 }}>
        <SentimentVerySatisfiedIcon color="primary" />,
      </div>
    </div>
  );
}
