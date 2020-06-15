import React, { useState, useEffect } from "react";
import MediaCard from "./mediacard";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import stringData from "./completed-series.json";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import Pagination from "@material-ui/lab/Pagination";
import Store from "electron-store";

const store = new Store();

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "100%",
    },
  },
}));

export default function Home() {
  const [anime, setAnime] = useState(stringData);
  const [value, setValue] = useState(null);
  const classes = useStyles();
  const [page, setPage] = React.useState(1);
  const itemCount = 12;

  useEffect(() => {
    if (value) setAnime([stringData[value.id]]);
    else setAnime(stringData);
  }, [value]);

  const handleChangePage = (event, newPage) => {
    var end = itemCount * newPage;
    var start = end - itemCount;
    setPage(newPage);
    setAnime(stringData.slice(start, end));
  };

  return (
    <>
      <Autocomplete
        id="highlights-demo"
        style={{ width: "100%" }}
        size="small"
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        options={stringData.map((opt) => ({ id: opt.id, name: opt.name }))}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search"
            variant="outlined"
            margin="normal"
          />
        )}
        renderOption={(option, { inputValue }) => {
          const matches = match(option.name, inputValue);
          const parts = parse(option.name, matches);

          return (
            <div>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{
                    fontWeight: part.highlight ? 700 : 400,
                    color: part.highlight ? "#f50057" : "inherit",
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          );
        }}
      />

      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
      >
        {anime.slice(0, itemCount).map((item, index) => (
          <MediaCard
            image={item.banner}
            title={item.name}
            description={item.desc}
            rating={item.rating}
            path={item.id}
            key={item.name}
            timeout={300 + index * 50}
            favourited={store.get(`favourites.${item.id}`) ? true : false}
          />
        ))}
      </Grid>
      <div className={classes.root}>
        <Pagination
          count={Math.ceil(stringData.length / itemCount)}
          page={page}
          onChange={handleChangePage}
        />
      </div>
    </>
  );
}
