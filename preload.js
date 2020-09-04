const { remote, shell } = require("electron");
const fs = require("fs");
const axios = require("axios");
const HTMLParser = require("node-html-parser");

const getIMBD = async (url) => {
  const res = await axios.get(url);
  const html = await res.data;
  const DOM = HTMLParser.parse(html);
  const rating = DOM.querySelector(".ratingValue").querySelector("strong")
    .rawText;
  const genre = DOM.querySelector(".title_wrapper")
    .querySelector(".subtext")
    .text.split("|")
    .map((i) => i.trim().replace(/\n/gm, ""));
  const desc = DOM.querySelector(".plot_summary")
    .text.split("\n")
    .map((i) => i.replace("|","").trim())
    .filter((i) => i.length > 0);

    return {
        rating: Number(rating),
        genre: genre,
        desc: desc    
    }
};

window.imdb = getIMBD;

window.remote = remote;
window.shell = shell;
window.directory = __dirname;
window.access = fs.access;
window.electron = true;
