import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { getLink } from "../utils/utils";
import Skeleton from "@material-ui/lab/Skeleton";
import { Grow, Fade, Collapse } from "@material-ui/core";

const useStyles = makeStyles({
  media: {
    width: 180,
    height: 265,
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "inherit",
    borderRadius: 8,
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

  return (
    <div className="poster animated animatedFadeInUp fadeInUp" onClick={handleClick}>
        <div className={classes.media}>
          <img
            className={classes.img}
            src={getLink(image)}
            alt={name}
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
    </div>
  );
}
