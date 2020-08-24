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
  },
});

export default function Drive() {
  const classes = useStyles();
  const columns = [
    { title: "Name", field: "name" },
    {
      title: "Size",
      field: "size",
      render: (rowData) => prettyBytes(Number(rowData.size)),
    },
    {
      title: "Thumbnail",
      field: "thumbnail",
      render: (rowData) => (
        <img
          src={`http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${rowData.name
            .split("]")[0]
            .replace("[", "")}`}
          alt={rowData.name}
          style={{ maxHeight: 50 }}
          onError={(e) =>
            (e.target.src =
              "http://localhost:9001/img/?url=" +
              "https://drive-thirdparty.googleusercontent.com/128/type/video/x-matroska")
          }
        />
      ),
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
    let mounted = true;
    const getState = async () => {
      const res1 = await fetch("http://127.0.0.1:9001/drive");
      const res2 = await fetch("http://127.0.0.1:9001/quota");
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

  return (
    <>
      <h1 style={{textAlign: 'center', marginTop: 48}}>
        {state.info.user ? state.info.user.displayName + " - " : ""}Google Drive
      </h1>
      <div className={classes.root}>
        {`Used: ${state.info.usedString}/${state.info.totalString}`}
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
                const res = await fetch(
                  "http://127.0.0.1:9001/delete/" + oldData.id
                );
                const res2 = await fetch("http://127.0.0.1:9001/quota");
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
    </>
  );
}
