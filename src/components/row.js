import React from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Grow from "@material-ui/core/Grow";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles({
  media: {
    width: "99%",
    height: 141,
    margin: 3,
    cursor: "pointer",
  },
  img: {
    width: 100,
    height: "inherit",
    objectFit: "cover",
    borderRadius: "4px 0px 0px 4px",
    display: "inline-block",
  },
});
export default function Row({ poster, name, keywords, rating }) {
  const classes = useStyles();
  const [checked] = React.useState(true);

  return (
    <Grow in={checked} timeout={800} className={classes.media} unmountOnExit>
      <Paper elevation={3}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px auto",
            width: "100%",
            height: "inherit",
          }}
        >
          <img
            className={classes.img}
            src={"http://localhost:9001/img/?url=" + poster}
            alt={name}
          />
          <div
            style={{
              paddingLeft: 20,
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>{name}</h2>
              {keywords.split(",").map((word) => (
                <Chip key={word} label={word} style={{ marginRight: 5 }} />
              ))}
            </div>
          </div>
        </div>
      </Paper>
    </Grow>
  );
}
