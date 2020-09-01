import React from "react";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";
import { makeStyles } from "@material-ui/core/styles";
import { getLink } from "../utils/utils";

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

type Props = {
  image: string,
  name: string,
  onClick: (id: number) => void,
  id: number
}

export default function Poster({ image, name, onClick, id }: Props) {
  const [checked] = React.useState(true);
  const classes = useStyles();

  const handleClick = () => onClick(id);

  return (
    <Grow in={checked} timeout={800} unmountOnExit>
      <div className={classes.media} onClick={handleClick}>
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
