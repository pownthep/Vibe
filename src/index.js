import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./App";
import Landing from "./components/landing";
import Loader from "./components/loader";
if (window.store) {
  (async () => {
    try {
      render(<Loader />, document.getElementById("root"));
      const seriesRes = await fetch("http://localhost:9001/reduced_series");
      const json = await seriesRes.json();
      window.data = json;
      render(<App />, document.getElementById("root"));
    } catch (error) {
      console.log(error);
    }
  })();
} else render(<Landing />, document.getElementById("root"));
