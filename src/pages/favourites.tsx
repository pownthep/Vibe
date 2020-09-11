import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import { Link } from "react-router-dom";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import { getImage } from "../utils/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    alignContent: "flex-start",
  },
  gridList: {
    width: "100%",
    height: "auto",
    transform: "translateZ(0)",
  },
  titleBar: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
    borderRadius: 4,
  },
  banner: {
    width: "100%",
    height: 230,
    objectFit: "cover",
    borderRadius: 4,
  },
  container: {
    width: "100%",
    height: "calc(100vh - 25px)",
    marginTop: "25px",
    background: theme.palette.background.paper,
    borderTopLeftRadius: 8,
    padding: 10,
  },
}));

export default function Favourites() {
  const setNavState = useSetRecoilState(navState);
  const favouritesString = localStorage.getItem("favourites");
  let localFavourites = {};
  if (favouritesString) localFavourites = JSON.parse(favouritesString);
  const classes = useStyles();
  const [favourites, setFavourites] = useState(localFavourites);

  const deleteFav = (id: string): void => {
    const prev: { [index: string]: any } = { ...favourites };
    delete prev[id];
    localStorage.setItem(`favourites`, JSON.stringify(prev));
    setFavourites(prev);
  };

  useEffect(() => {
    setNavState("Favourites");
  }, [setNavState]);

  return (
    <div className={classes.container}>
      {favourites && (
        <div className={classes.root}>
          <GridList
            cellHeight={230}
            spacing={5}
            className={classes.gridList}
            cols={4}
          >
            {Object.keys(favourites).map((key) => (
              <GridListTile
                key={key}
                className="animated animatedFadeInUp fadeInUp"
                style={{ borderRadius: 4, overflow: "hidden" }}
              >
                <Link to={"/watch/" + key}>
                  <img
                    src={getImage(window.data[parseInt(key)].banner)}
                    alt="cover"
                    className={classes.banner}
                  />
                </Link>
                <GridListTileBar
                  title={window.data[parseInt(key)].name}
                  titlePosition="top"
                  actionIcon={
                    <IconButton
                      aria-label="Unfavourite"
                      onClick={() => deleteFav(key)}
                    >
                      <HighlightOffIcon style={{ color: "white" }} />
                    </IconButton>
                  }
                  actionPosition="left"
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      )}
    </div>
  );
}
