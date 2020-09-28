import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Tooltip } from "@material-ui/core";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import DownloadItem from "../components/download-page-components/download_item";
import {
  getDownloadedFiles,
  DL_PROGRESS_API,
  DL_FOLDER_PATH,
} from "../utils/api";
import { handleError, openFolder } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  downloading: {
    width: "100%",
    height: "calc(100vh - 100px)",
    overflow: "auto",
  },
  container: {
    width: "calc(100vw - 190px)",
    height: "calc(100vh - 136px)",
    marginTop: "25px",
    background: "var(--thumbBG)",
    borderRadius: 8,
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
  const [mounted, setMounted] = React.useState(true);
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
    let eventSource = new EventSource(DL_PROGRESS_API);
    eventSource.onmessage = (e) => {
      let json = JSON.parse(e.data);
      if (mounted) setDownloading(json);
      if (json.length === 0) getFiles();
    };
    return () => {
      eventSource.close();
      setMounted(false);
    };
  }, [setNavState, mounted]);

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
                id={file.id}
                progress={(file.progress / file.size) * 100}
              />
            </div>
          ))}
          {downloaded.map((file) => (
            <DownloadItem
              key={file}
              name={file.split("@")[1]}
              id={file.split("@")[0]}
              path={file}
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
