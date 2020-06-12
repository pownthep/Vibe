import React, { useEffect, useState } from "react";
import MediaCard from "./mediacard";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
// import { useDebounce } from "use-lodash-debounce";
import { debounce } from "lodash";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "100%",
    },
  },
}));

export default function Home() {
  const [data, setData] = useState([]);
  const [anime, setAnime] = useState([]);
  const classes = useStyles();

  // Create a new instance of Fuse
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      const response = await fetch(`http://localhost:9001/data`);
      const json = await response.json();
      if (!ignore) setData(json);
      setAnime(json);
      console.log("hello");
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearchInput = (event) => {
    event.persist();
    const debouncedFn = debounce(() => {
      let searchString = event.target.value;
      if (!searchString) setAnime(data);
      else {
        const result = data.filter(
          (item) =>
            item.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1
        );
        setAnime(result);
      }
    }, 300);
    debouncedFn();
  };

  return (
    <>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
      >
        <TextField
          id="filled-secondary"
          label="Search"
          variant="filled"
          color="primary"
          onChange={handleSearchInput}
        />
      </form>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="flex-start"
      >
        {anime.map((item, index) => (
          <Link to={"/watch/" + item.id} key={item.id}>
            <MediaCard
              image={item.banner}
              title={item.name}
              description={item.desc}
            />
          </Link>
        ))}
      </Grid>
    </>
  );
}
