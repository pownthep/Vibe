import React from "react";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";
import { makeStyles } from "@material-ui/core/styles";
import { getLink } from "../utils/utils";
import Skeleton from "@material-ui/lab/Skeleton";

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
  },
});

type Props = {
  image: string;
  name: string;
  onClick: (id: number) => void;
  id: number;
};

export default function Poster({ image, name, onClick, id }: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const classes = useStyles();

  const handleClick = () => onClick(id);
  const onLoad = (e: any) => {
    setLoaded(true);
  };

  return (
    <div className={classes.media} onClick={handleClick}>
      <Grow in={true} timeout={800}>
        <div className={classes.media}>
          {!loaded && (
            <Skeleton
              animation="wave"
              width="100%"
              height="265px"
              variant="rect"
            ></Skeleton>
          )}
          <img
            className={classes.img}
            src={getLink(image)}
            alt={name}
            onLoad={onLoad}
            style={{ display: loaded ? "block" : "none" }}
          />
          <Typography
            display="block"
            gutterBottom
            noWrap={true}
            style={{ textAlign: "center" }}
          >
            {name}
          </Typography>
        </div>
      </Grow>
    </div>
  );
}
