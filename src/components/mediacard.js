import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from "@material-ui/core/Chip";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@material-ui/icons/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@material-ui/icons/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";

const useStyles = makeStyles({
  root: {
    //maxWidth: "32%",
    width: 480,
    height: 270,
    margin: 2,
  },
  media: {
    height: 270,
    width: "100",
    backgroundSize: "cover",
  },
  customWidth: {
    width: 500,
  },
});

export default function MediaCard(props) {
  const classes = useStyles();
  const [checked] = useState(true);

  return (
    <Grow in={checked} timeout={props.timeout} className={classes.root} unmountOnExit>
      <Link to={"/watch/" + props.path}>
        <Card>
          <CardActionArea>
            <Tooltip
              placement="right-start"
              TransitionComponent={Grow}
              TransitionProps={{ timeout: 600 }}
              title={
                <TooltipContent
                  desc={props.description}
                  keywords={props.keywords}
                  title={props.title}
                  rating={props.rating}
                />
              }
              classes={{ tooltip: classes.customWidth }}
            >
              <CardMedia
                className={classes.media}
                image={
                  window.store
                    ? "http://localhost:9001/img/?url=" + props.image
                    : props.image
                }
                //title={props.title}
              />
            </Tooltip>
            {/* <CardContent>
            <Typography gutterBottom variant="h5" component="h2" noWrap>
              {props.title}
            </Typography>
          </CardContent> */}
          </CardActionArea>
          {/* <CardActions>
          <Link to={"/watch/" + props.path}>
            <Button
              size="small"
              color="primary"
              startIcon={<PlayCircleOutlineIcon />}
            >
              Watch
            </Button>
          </Link>
          <Button
            disabled={fav}
            size="small"
            color="secondary"
            onClick={handleFavClick}
            startIcon={<FavoriteBorderIcon />}
          >
            {fav ? "Favourited" : "Add to favourites"}
          </Button>
        </CardActions> */}
        </Card>
      </Link>
    </Grow>
  );
}

function TooltipContent(props) {
  return (
    <div style={{ position: "relative" }}>
      <Typography style={{ margin: 1, width: "70%" }}>{props.title}</Typography>
      <div style={{ position: "absolute", top: 0, right: 5 }}>
        {customIcons[Math.floor(props.rating)]}
      </div>
      {props.keywords.split(",").map((keyword) => (
        <Chip key={keyword + "-chip"} label={keyword} style={{ margin: 1 }} />
      ))}
    </div>
  );
}

const customIcons = [
  <SentimentVeryDissatisfiedIcon color="error" />,
  <SentimentDissatisfiedIcon color="action" />,
  <SentimentSatisfiedIcon color="primary" />,
  <SentimentSatisfiedAltIcon color="primary" />,
  <SentimentVerySatisfiedIcon color="primary" />,
];
