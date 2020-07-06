import React from "react";
import { render } from "react-dom";
import App from "./App";
import Landing from "./components/landing";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import "./index.css";

if (window.store) {
  (async () => {
    try {
      // render(<Loader />, document.getElementById("root"));
      nprogress.start();
      const seriesRes = await fetch("http://localhost:9001/reduced_series");
      const json = await seriesRes.json();
      window.data = json;
      nprogress.done();
      render(<App />, document.getElementById("root"));
    } catch (error) {
      console.log(error);
    }
  })();
} else render(<Landing />, document.getElementById("root"));
