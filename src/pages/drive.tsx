import React from "react";
import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import prettyBytes from "pretty-bytes";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import Container from "../components/common-components/container";
import SearchBar from "../components/common-components/search_bar";
import { IconButton, Typography } from "@material-ui/core";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import DeleteForeverRoundedIcon from "@material-ui/icons/DeleteForeverRounded";
import PlayCircleFilledRoundedIcon from "@material-ui/icons/PlayCircleFilledRounded";

import {
  searchDrive,
  getMyDriveItem,
  getImage,
  deleteFile,
} from "../utils/api";
import { handleError } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  rowItem: {
    borderRadius: 4,
    overflow: "hidden",
    height: 70,
    width: "99%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: theme.palette.background.default,
  },
  rowItemDetal: {
    marginRight: "auto",
    marginLeft: "20px",
  },
  rowItemAction: {},
  rowItemImg: {
    width: 150,
    height: 70,
    objectFit: "none",
  },
}));

export default function Drive() {
  const setNavState = useSetRecoilState(navState);
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [mounted, setMount] = useState(true);

  const handleDelete = (id: string) => {
    nprogress.start();
    deleteFile(id)
      .then(() => {
        const filtered = data.filter((i: any) => !i.id.includes(id));
        setData(filtered);
      })
      .catch((e) => handleError(e))
      .finally(() => nprogress.done());
  };

  const Row = ({ index, style }: any) => {
    const { id, name, size, mimeType, ownedByMe } = data[index];
    return (
      <div style={style}>
        <div className={classes.rowItem}>
          <img
            src={getImage(
              "https://drive-thirdparty.googleusercontent.com/16/type/video/x-matroska"
            )}
            alt="thumbnail"
            className={classes.rowItemImg}
          />
          <div className={classes.rowItemDetal}>
            <Typography variant="subtitle1" gutterBottom>
              {name}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              {mimeType} - {prettyBytes(Number(size))}
            </Typography>
          </div>
          <div className={classes.rowItemAction}>
            <IconButton>
              <PlayCircleFilledRoundedIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(id)} disabled={!ownedByMe}>
              <DeleteForeverRoundedIcon />
            </IconButton>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    nprogress.start();
    setNavState("Google Drive");
    if (!window.electron) return;
    const getState = async () => {
      const data = await getMyDriveItem();
      if (mounted) setData(data);
      nprogress.done();
    };
    getState();
    return () => {
      setMount(false);
      nprogress.done();
    };
  }, [setNavState, mounted]);

  const search = (e: any) => {
    if (e.keyCode === 13) {
      nprogress.start();
      e.preventDefault();
      const text = e.target.value;
      searchDrive(text)
        .then((json) => {
          setData(json);
        })
        .catch((e) => handleError(e))
        .finally(() => {
          nprogress.done();
        });
    }
  };

  const render = () => (
    <Container>
      <SearchBar onKeyHandler={search} />
      <div
        style={{
          height: "calc(100vh - 120px)",
          width: "100%",
          marginTop: 15,
          paddingLeft: 20,
        }}
      >
        <AutoSizer>
          {({ height, width }) => {
            return (
              <List
                className="List"
                height={height}
                itemCount={data.length}
                itemSize={75}
                width={width}
              >
                {Row}
              </List>
            );
          }}
        </AutoSizer>
      </div>
    </Container>
  );
  return render();
}
