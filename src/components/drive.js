import React from "react";
import { useEffect, useState } from "react";
import MaterialTable from "material-table";
import Grow from "@material-ui/core/Grow";

export default function Drive() {
  const columns = [
    { title: "Name", field: "name" },
    { title: "Size", field: "size" },
    {
      title: "Thumbnail",
      field: "thumbnail",
      render: (rowData) => <img src={"http://127.0.0.1:9001/img/?url="+rowData.thumbnail} alt={rowData.name} style={{maxHeight: 50}}/>,
    },
  ];
  const [data, setState] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function getData() {
      const res = await fetch("http://127.0.0.1:9001/drive");
      const json = await res.json();
      setState(json);
      setLoading(false);
    }
    getData();
  }, []);

  return (
    <>
      <h1>Google Drive</h1>
      <Grow in={true} timeout={300}>
      <MaterialTable
        title=""
        columns={columns}
        data={data}
        isLoading={loading}
        options={{
          actionsColumnIndex: -1,
        }}
        editable={{
          onRowDelete: (oldData) =>
            new Promise(async (resolve, reject) => {
              const res = await fetch(
                "http://127.0.0.1:9001/delete/" + oldData.id
              );
              const json = await res.json();
              if (json.deleted) {
                const dataDelete = [...data];
                const index = oldData.tableData.id;
                dataDelete.splice(index, 1);
                setState([...dataDelete]);
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
