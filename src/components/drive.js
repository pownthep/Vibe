import React from "react";
import { useEffect, useState } from "react";
import MaterialTable from "material-table";
import Grow from "@material-ui/core/Grow";
import { LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import prettyBytes from "pretty-bytes";

const useStyles = makeStyles({
  root: {
    width: "100%",
    display: "inline-block",
    marginBottom: 20,
    marginTop: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default function Drive() {
  const classes = useStyles();
  const columns = [
    {
      title: "Thumbnail",
      field: "thumbnail",
      render: (rowData) => (
        <img
          src={`${
            window.API
          }img/?url=https://lh3.googleusercontent.com/u/0/d/${rowData.name
            .split("]")[0]
            .replace("[", "")}`}
          alt={rowData.name}
          style={{ height: 50, width: 50, objectFit: "cover", borderRadius: "50%" }}
        />
      ),
    },
    { title: "Name", field: "name" },
    {
      title: "Size",
      field: "size",
      render: (rowData) => prettyBytes(Number(rowData.size)),
    },
  ];
  const [state, setState] = useState({
    data: [],
    info: {
      usedNumber: 0,
      totalNumber: 1,
      usedString: "0 B",
      totalString: "15 GB",
    },
    loading: true,
  });

  useEffect(() => {
    if (!window.remote) return; 
    let mounted = true;
    const getState = async () => {
      const res1 = await fetch(window.API + "drive");
      const res2 = await fetch(window.API + "quota");
      const data = await res1.json();
      const info = await res2.json();
      console.log("setting state");
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
  }, []);
  if (window.remote) {
    return (
      <div style={{ marginTop: 55 }}>
        <div className={classes.root}>
          {`${state.info.usedString} / ${state.info.totalString} used`}
          <LinearProgress
            variant="determinate"
            value={(state.info.usedNumber / state.info.totalNumber) * 100}
          />
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
              onRowDelete: (oldData) =>
                new Promise(async (resolve, reject) => {
                  const res = await fetch(window.API + "delete/" + oldData.id);
                  const res2 = await fetch(window.API + "quota");
                  const info = await res2.json();
                  const json = await res.json();
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
