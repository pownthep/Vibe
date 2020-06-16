import React, { useState } from "react";
import Store from "electron-store";
import stringData from "./completed-series.json";
import { makeStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { Link } from "react-router-dom";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import Grow from "@material-ui/core/Grow";

const store = new Store();

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: "inherit",
    alignContent: "flex-start",
  },
  gridList: {
    width: "100%",
    height: "auto",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
  },
  titleBar: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
  icon: {
    color: "white",
  },
  banner: {
    width: "100%",
    height: 230,
  },
}));

export default function Favourites() {
  const classes = useStyles();
  const [favourites, setFavourites] = useState(store.get("favourites"));
  const [checked] = React.useState(true);

  return (
    <>
      <h1>My Favourites</h1>
      {favourites ? (
        <>
          <div className={classes.root}>
            <GridList
              cellHeight={230}
              spacing={1}
              className={classes.gridList}
              cols={4}
            >
              {Object.keys(favourites).map((key, index) => (
                <Grow in={checked} timeout={300 + index * 50} key={key}>
                  <GridListTile>
                    <Link to={"/watch/" + key}>
                      <img
                        src={
                          "http://localhost:9001/img/?url=" +
                          stringData[parseInt(key)].banner
                        }
                        alt={stringData[parseInt(key)].name}
                        className={classes.banner}
                      />
                    </Link>
                    <GridListTileBar
                      title={stringData[parseInt(key)].name}
                      titlePosition="top"
                      actionIcon={
                        <IconButton
                          aria-label={`star ${stringData[parseInt(key)].name}`}
                          className="favourite-icon"
                          onClick={(e) => {
                            store.delete(`favourites.${key}`);
                            setFavourites(store.get("favourites"));
                          }}
                          onMouseEnter={() =>
                            setFavourites((prev) => ({
                              ...prev,
                              [key]: false,
                            }))
                          }
                          onMouseLeave={() =>
                            setFavourites((prev) => ({
                              ...prev,
                              [key]: true,
                            }))
                          }
                        >
                          {!favourites[key] ? (
                            <HighlightOffIcon />
                          ) : (
                            <FavoriteIcon />
                          )}
                        </IconButton>
                      }
                      actionPosition="left"
                      className={classes.titleBar}
                    />
                  </GridListTile>
                </Grow>
              ))}
            </GridList>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
