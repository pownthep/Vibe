const axios = require("axios");
const HTMLParser = require("node-html-parser");
const fs = require("fs");

const getIMBD = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
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
        .map((i) => i.replace("|", "").trim())
        .filter((i) => i.length > 0);

      resolve({
        rating: Number(rating),
        genre: genre,
        desc: desc,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const moveFile = (currentPath, newPath) => {
  try {
    fs.renameSync(currentPath, newPath);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getIMBD,
  moveFile,
};
