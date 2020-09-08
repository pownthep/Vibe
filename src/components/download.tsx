import React from "react";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Tooltip } from "@material-ui/core";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import {
  openFolder,
  DL_FOLDER_PATH,
  DL_API,
  handleError,
  getDownloadedFiles,
} from "../utils/utils";

import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import DownloadItem from "./download_item";

const useStyles = makeStyles((theme) => ({
  downloading: {
    width: "100%",
    height: "calc(100vh - 100px)",
    overflow: "auto",
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

type DownloadItem = {
  name: string;
  progress: number;
  size: number;
  id: string;
};

export default function Download() {
  const classes = useStyles();
  const [downloading, setDownloading] = React.useState(
    [] as Array<DownloadItem>
  );
  const [downloaded, setDownloaded] = React.useState([] as Array<string>);

  const setNavState = useSetRecoilState(navState);

  const getFiles = () => {
    getDownloadedFiles()
      .then((json) => {
        setDownloaded(json);
      })
      .catch((e) => handleError(e));
  };

  React.useEffect(() => {
    getFiles();
    setNavState("Downloads");
    let eventSource = new EventSource(DL_API);
    eventSource.onmessage = (e) => {
      let json = JSON.parse(e.data);
      setDownloading(json);
      if (json.length === 0) getFiles();
    };
    return () => {
      eventSource.close();
    };
  }, [setNavState]);

  const handleFolderButtonClick = () => {
    openFolder(DL_FOLDER_PATH);
  };

  if (window.electron) {
    return (
      <div className={classes.container}>
        <IconButton
          edge="end"
          aria-label="pause button"
          onClick={handleFolderButtonClick}
        >
          <Tooltip title="Open folder">
            <FolderOpenIcon />
          </Tooltip>
        </IconButton>
        <div className={classes.downloading}>
          {downloading.map((file) => (
            <div key={file.name}>
              <DownloadItem
                name={file.name}
                id={file.name.replace(".mp4", "")}
                progress={(file.progress / file.size) * 100}
              />
              <Divider />
            </div>
          ))}
          {downloaded.map((file) => (
            <DownloadItem
              key={file}
              name={file}
              id={file.replace(".mp4", "")}
            />
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <h1 style={{ textAlign: "center", marginTop: 100 }}>
        Only available on Desktop App
      </h1>
    );
  }
}
