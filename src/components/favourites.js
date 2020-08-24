import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { Link } from "react-router-dom";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import Grow from "@material-ui/core/Grow";

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
    objectFit: "cover",
    borderRadius: 4,
  },
}));

export default function Favourites() {
  const localFavourites = localStorage.getItem("favourites")
    ? JSON.parse(localStorage.getItem("favourites"))
    : {};
  const classes = useStyles();
  const [favourites, setFavourites] = useState(localFavourites);
  const [checked] = React.useState(true);

  const deleteFav = (e) => {
    const prev = { ...favourites };
    if (delete prev[e.currentTarget.id]) {
      localStorage.setItem(`favourites`, JSON.stringify(prev));
      setFavourites(prev);
    }
  };

  return (
    <>
      <h1 style={{textAlign: 'center', marginTop: 48}}>My Favourites</h1>
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
                          window.desktop
                            ? "http://localhost:9001/img/?url=" +
                              window.data[parseInt(key)]
                            : window.data[parseInt(key)].banner
                        }
                        alt="cover"
                        className={classes.banner}
                        onError={(e) =>
                          (e.target.src = window.data[parseInt(key)].banner)
                        }
                      />
                    </Link>
                    <GridListTileBar
                      title={window.data[parseInt(key)].name}
                      titlePosition="top"
                      actionIcon={
                        <IconButton
                          aria-label={`star ${window.data[parseInt(key)].name}`}
                          className="favourite-icon"
                          id={key}
                          onClick={deleteFav}
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
