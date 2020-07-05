import React, { useState, useEffect } from "react";
import MediaCard from "./mediacard";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import ListboxComponent from "./listbox";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import Poster from "./poster";

export default function Home() {
  const [anime, setAnime] = useState([]);
  const [value, setValue] = useState(null);
  const [item, setItem] = useState({
    width: 480,
    height: 270,
    rowHeight: 275,
    viewMode: 0,
  });
  let itemsPerRow = 1;

  const history = useHistory();

  function handleClick(e) {
    history.push("/watch/" + e.currentTarget.id);
  }

  function viewGenerator(props) {
    if (item.viewMode === 0)
      return <MediaCard image={props.banner} name={props.name} />;
    else if (item.viewMode === 1)
      return <Poster image={props.poster} name={props.name} />;
    else return <MediaCard image={props.banner} name={props.name} />;
  }

  const Row = ({ index, style }) => {
    var start = index * itemsPerRow;
    var end = start + itemsPerRow;
    return (
      <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {anime.slice(start, end).map((el) => (
            <a onClick={handleClick} key={el.id} id={el.id}>
              {viewGenerator(el)}
            </a>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (value) {
      const result = anime.filter((item) => item.id === value.id);
      setAnime(result);
    } else {
      setAnime(window.data);
    }
    return () => {};
  }, [value]);

  return (
    <>
      <div
        style={{
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Autocomplete
          id="virtualize-demo"
          style={{
            width: 480,
            margin: "0 auto",
            marginBottom: 0,
            marginTop: 20,
          }}
          disableListWrap
          ListboxComponent={ListboxComponent}
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          options={anime}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Search"
              variant="outlined"
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
        <Tooltip title="List view">
          <IconButton
            aria-label="view list"
            onClick={() =>
              setItem({
                width: 480,
                height: 270,
                rowHeight: 275,
                viewMode: 0,
              })
            }
          >
            <ViewListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Grid view">
          <IconButton
            aria-label="view comfy"
            onClick={() =>
              setItem({
                width: 185,
                height: 265,
                rowHeight: 310,
                viewMode: 1,
              })
            }
          >
            <ViewComfyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Large view">
          <IconButton
            aria-label="view module"
            onClick={() =>
              setItem({
                width: 480,
                height: 270,
                rowHeight: 275,
                viewMode: 0,
              })
            }
          >
            <ViewModuleIcon />
          </IconButton>
        </Tooltip>
      </div>
      {anime ? (
        <div style={{ width: "100%", height: "85vh", borderRadius: 4 }}>
          <AutoSizer>
            {({ height, width }) => {
              itemsPerRow = Math.floor(width / item.width);
              var rowCount = Math.ceil(anime.length / itemsPerRow);
              return (
                <List
                  className="List"
                  height={height}
                  itemCount={rowCount}
                  itemSize={item.rowHeight}
                  width={width}
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
