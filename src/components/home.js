import React, { useState, useEffect } from "react";
import MediaCard from "./mediacard";
import { makeStyles } from "@material-ui/core/styles";
import stringData from "./completed-series.json";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import Pagination from "@material-ui/lab/Pagination";
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "100%",
    },
  },
  gridList: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "flex-start",
  },
  pagination: {
    margin: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
  },
  listbox: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
}));

export default function Home() {
  const store = window.store ? new window.store() : false;
  const options = stringData.map((opt) => ({ id: opt.id, name: opt.name }));
  const [anime, setAnime] = useState(stringData.slice(0, 100));
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

  const addToFavourite = (key) => {
    if (!store) return;
    if (store.get("favourites")) store.set(key, true);
    else {
      store.set("favourites", {});
      store.set(key, 1);
    }
  };

  return (
    <>
      <Autocomplete
        id="virtualize-demo"
        style={{ width: "50%", margin: "0 auto" }}
        disableListWrap
        ListboxComponent={ListboxComponent}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        options={options}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            label="Search"
            // // InputProps={{
            // //   startAdornment: (
            // //     <InputAdornment position="start">
            // //       <SearchIcon />
            // //     </InputAdornment>
            // //   ),
            // }}
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
                    color: part.highlight ? "#11cb5f" : "inherit",
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          );
        }}
      />
      <div className={classes.gridList}>
        {anime.slice(0, itemCount).map((item, index) => (
          <MediaCard
            image={item.banner}
            title={item.name}
            description={item.desc}
            rating={item.rating}
            path={item.id}
            key={item.name}
            keywords={item.keywords}
            timeout={300 + index * 50}
            favourited={
              store
                ? store.get(`favourites.${item.id}`)
                  ? true
                  : false
                : false
            }
            onChildClick={addToFavourite}
          />
        ))}
      </div>
      <div className={classes.pagination}>
        <Pagination
          count={Math.ceil(stringData.length / itemCount)}
          page={page}
          color="primary"
          onChange={handleChangePage}
        />
      </div>
    </>
  );
}
