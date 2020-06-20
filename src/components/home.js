import React, { useState, useEffect } from "react";
import MediaCard from "./mediacard";
import { makeStyles } from "@material-ui/core/styles";
import stringData from "./completed-series.json";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import Pagination from "@material-ui/lab/Pagination";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ListSubheader from "@material-ui/core/ListSubheader";
import { useTheme } from "@material-ui/core/styles";
import { VariableSizeList } from "react-window";
import PropTypes from "prop-types";

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

const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}
const options = stringData.map((opt) => ({ id: opt.id, name: opt.name }));
//const options = stringData.map((opt) => opt.name);

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;
  console.log(props);
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

const store = window.store ? new window.store() : false;

export default function Home() {
  const [anime, setAnime] = useState(stringData.slice(0, 100));
  const [value, setValue] = useState(null);
  const classes = useStyles();
  const [page, setPage] = React.useState(1);
  const itemCount = 6;

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
          <TextField {...params} variant="standard" label="🔎 Search" />
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
            keyworkds={item.keywords}
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
          onChange={handleChangePage}
        />
      </div>
    </>
  );
}
