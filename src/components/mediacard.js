import React from "react";
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
  const [checked] = React.useState(true);

  return (
    <Grow in={checked} timeout={props.timeout}>
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={props.image}
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
          <Link to={props.path}>
            <Button size="small" color="secondary">
              Watch
            </Button>
          </Link>
          <Button size="small" color="secondary">
            Favourite
          </Button>
        </CardActions>
      </Card>
    </Grow>
  );
}
