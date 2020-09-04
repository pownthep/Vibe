import React, { useEffect } from "react";
import { searchIMDB, getIMDBInfo } from "../utils/utils";
import { IMDBSearchResponse } from "../utils/interfaces";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { useParams } from "react-router-dom";

export default function AddPage() {
  const [result, setResult] = React.useState([] as Array<IMDBSearchResponse>);
  const [details, setDetails] = React.useState({} as any);
  const [shows, setShows] = React.useState([] as any);

//   let { id } = useParams();

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3000/data/mergedV2.json");
      console.log(res);
      const shows = await res.json();
      setShows(shows);
    })();
    return () => {};
  }, []);

  const handleChange = async (e: any) => {
    nprogress.start();
    if (e.keyCode === 13) {
      const text = e.target.value;
      const res = await searchIMDB(text);
      setResult(res);
      nprogress.done();
    }
  };

  const handleClick = async (url: string, index: number) => {
    nprogress.start();
    const info = await getIMDBInfo(url);
    setDetails({
      ...details,
      [index]: info,
    });
    nprogress.done();
  };

  return (
    <div style={{ marginTop: 100 }}>
      {shows.map((s: any, i: any) => (
        <div key={i}>
          {s.name}
          <button
            onClick={async () => {
              const res = await searchIMDB(s.name);
              setDetails({
                ...details,
                [i]: res,
              });
            }}
          >
            findIMDB
          </button>
          {details[i] && (
            <div>
              {details[i].map((r: any, i: any) => (
                <div key={r.link}>
                  <span>
                    <img src={r.img} alt="poster" />
                    {r.title}
                  </span>
                  <button onClick={() => handleClick(r.link, i)}>
                    get info
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {/* <input type="text" onKeyDown={handleChange} />
      {result.map((r, i) => (
        <div>
          <span>
            <img src={r.img} alt="poster" />
            {r.title}
          </span>
          <button onClick={() => handleClick(r.link, i)}>get info</button>
          <br/>
          {details[i] && JSON.stringify(details[i])}
        </div>
      ))} */}
    </div>
  );
}
