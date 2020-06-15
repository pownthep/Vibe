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
import Store from "electron-store";

const useStyles = makeStyles({
  root: {
    maxWidth: 360,
    margin: "8px",
  },
  media: {
    height: 140,
    width: 360,
    backgroundSize: "cover",
  },
});

export default function MediaCard(props) {
  const classes = useStyles();
  const [checked] = useState(true);
  const store = new Store();
  const [fav, setFav] = useState(props.favourited);

  return (
    <Grow in={checked} timeout={props.timeout}>
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={"http://localhost:9001/img/?url=" + props.image}
            title={props.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" noWrap>
              {props.title}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              noWrap
            >
              {props.description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Link to={"/watch/" + props.path}>
            <Button size="small" color="secondary">
              Watch
            </Button>
          </Link>
          <Button
            disabled={fav}
            size="small"
            color="secondary"
            onClick={(e) => {
              var key = "favourites." + props.path;
              if (store.get("favourites")) store.set(key, true);
              else {
                store.set("favourites", {});
                store.set(key, 1);
              }
              setFav(true);
            }}
          >
            {fav ? "Favourited" : "Add to favourites"}
          </Button>
        </CardActions>
      </Card>
    </Grow>
  );
}
