import React from "react";
import { useEffect, useState } from "react";
import MaterialTable from "material-table";
import Grow from "@material-ui/core/Grow";
import { makeStyles } from "@material-ui/core/styles";
import prettyBytes from "pretty-bytes";
import { deleteFile, getQuota, getDrive, getImg } from "../utils/utils";
import { DriveInfo, DriveState } from "../utils/interfaces";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    display: "inline-block",
    marginBottom: 20,
    marginTop: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20,
  },
  container: {
    width: "100%",
    height: "calc(100vh - 25px)",
    marginTop: "25px",
    background: theme.palette.background.paper,
    borderTopLeftRadius: 8,
  },
}));

export default function Drive() {
  const setNavState = useSetRecoilState(navState);
  const classes = useStyles();
  const columns = [
    {
      title: "Thumbnail",
      field: "thumbnail",
      render: (rowData: DriveInfo) => (
        <img
          src={getImg(rowData.name.replace(".mp4", ""))}
          alt={rowData.name}
          style={{
            height: 50,
            width: 50,
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ),
    },
    { title: "Name", field: "name" },
    {
      title: "Size",
      field: "size",
      render: (rowData: DriveInfo) => prettyBytes(Number(rowData.size)),
    },
  ];
  const [state, setState] = useState({
    data: [],
    info: {
      user: {} as any,
      usedNumber: 0,
      totalNumber: 1,
      usedString: "0 B",
      totalString: "15 GB",
    },
    loading: true,
  } as DriveState);

  useEffect(() => {
    setNavState("Google Drive");
    if (!window.electron) return;
    let mounted = true;
    const getState = async () => {
      const data = await getDrive();
      const info = await getQuota();
      if (mounted)
        setState((json) => ({
          ...json,
          data: data,
          info: info,
          loading: false,
        }));
    };
    getState();
    return () => {
      mounted = false;
    };
  }, [setNavState]);
  if (window.electron) {
    return (
      <div className={classes.container}>
        <div className={classes.root}>
          {`${state.info.usedString} / ${state.info.totalString} used`}
        </div>
        <Grow in={true} timeout={300}>
          <MaterialTable
            title=""
            columns={columns}
            data={state.data}
            isLoading={state.loading}
            options={{
              actionsColumnIndex: -1,
            }}
            editable={{
              onRowDelete: (oldData: DriveInfo) =>
                new Promise(async (resolve, reject) => {
                  const json = await deleteFile(oldData.id);
                  const info = await getQuota();
                  if (json.deleted) {
                    const dataDelete = [...state.data];
                    const index = oldData.tableData.id;
                    dataDelete.splice(index, 1);
                    setState((prev) => ({
                      ...prev,
                      data: [...dataDelete],
                      info: info,
                    }));
                    resolve();
                  } else {
                    reject();
                  }
                }),
            }}
          />
        </Grow>
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
