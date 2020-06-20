import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";

const useStyles = makeStyles({
  root: {
    maxWidth: 360,
    margin: 10,
    width: "100%",
    height: "auto",
  },
  media: {
    height: 140,
    width: "auto",
    backgroundSize: "cover",
  },
});

export default function MediaCard(props) {
  const classes = useStyles();
  const [checked] = useState(true);
  const [fav, setFav] = useState(props.favourited);

  const handleFavClick = () => {
    var key = "favourites." + props.path;
    props.onChildClick(key);
    setFav(true);
  };

  return (
    <Grow in={checked} timeout={props.timeout} className={classes.root}>
      <Card>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={
              window.store
                ? "http://localhost:9001/img/?url=" + props.image
                : props.image
            }
            title={props.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" noWrap>
              {props.title}
            </Typography>
            {/* <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              // noWrap
            >
              {props.keywords}
            </Typography> */}
          </CardContent>
        </CardActionArea>
        <CardActions>
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
        </CardActions>
      </Card>
    </Grow>
  );
}
