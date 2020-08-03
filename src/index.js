import React from "react";
import { render } from "react-dom";
import App from "./App";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import "./index.css";

// if (window.store) {
(async () => {
  try {
    nprogress.start();
    if (localStorage["data"]) {
      window.data = JSON.parse(localStorage["data"]);
      nprogress.done();
      render(<App />, document.getElementById("root"));
      const seriesRes = await fetch("https://vibe-three.vercel.app/data/trimmed-desktop.json");
      const json = await seriesRes.json();
      window.data = json;
      localStorage["data"] = JSON.stringify(json);
    } else {
      const seriesRes = await fetch("https://vibe-three.vercel.app/data/trimmed-desktop.json");
      const json = await seriesRes.json();
      window.data = json;
      localStorage["data"] = JSON.stringify(json);
      nprogress.done();
      render(<App />, document.getElementById("root"));
    }
  } catch (error) {
    console.log(error);
  }
})();
// } else render(<Landing />, document.getElementById("root"));
