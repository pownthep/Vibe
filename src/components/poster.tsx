import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { getLink } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  media: {
    width: 180,
    height: 265,
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "inherit",
    borderRadius: 5,
    // boxShadow: `0 14px 30px ${theme.palette.primary.main}26,0 4px 4px ${theme.palette.primary.main}0d`,
    boxShadow: theme.shadows[4],
  },
}));

type Props = {
  image: string;
  name: string;
  onClick: (id: number) => void;
  id: number;
  width: number;
  height: number;
};

export default function Poster({
  image,
  name,
  onClick,
  id,
  width,
  height,
}: Props) {
  const classes = useStyles();
  const handleClick = () => onClick(id);

  return (
    <div
      className="poster animated animatedFadeInUp fadeInUp"
      onClick={handleClick}
    >
      <div
        style={{
          width: width,
          height: height,
          cursor: "pointer",
        }}
      >
        <img className={classes.img} src={getLink(image)} alt={name} />
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
