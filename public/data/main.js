//const data = require("completed-series.json");
const fs = require("fs");
const axios = require("axios");

fs.readFile(__dirname + "/completed-series.json", (err, content) => {
  if (err) console.log(err);
  let json = JSON.parse(content);
  let filtered = json.filter((item) => item.episodes.length > 0);
  let reduced = filtered.map((i, index) => ({
    ...i,
    id: index,
    desc: "",
  }));
  fs.writeFile(
    __dirname + "/filtered.json",
    JSON.stringify(filtered),
    () => {}
  );
  fs.writeFile(__dirname + "/reduced.json", JSON.stringify(reduced), () => {});
  (async () => {
    let fullData = [];
    for (anime of reduced) {
      console.log(anime.name);
      let episodes = [];
      for (folderId of anime.episodes) {
        let resp = await axios.get(
          "https://drive.google.com/drive/folders/" + folderId
        );
        let data = await resp.data;
        let start = data.indexOf(`window['_DRIVE_ivd'] = '`);
        let sm = data.substring(start);
        let end = sm.indexOf("';");
        let assignment = sm.substring(0, end + 1);
        let code = assignment.replace(
          `window['_DRIVE_ivd'] =`,
          "var driveData ="
        );
        eval(code);
        let json = JSON.parse(driveData);
        let final = json[0].map((item) => {
          return {
            id: item[0],
            name: item[2]
              .replace(/Copy of/g, "")
              .replace(/.mkv/g, "")
              .replace(/\[(.+?)\]/g, "")
              .replace(/\((.+?)\)/g, "")
              .trim(),
          };
        });
        episodes = [...episodes, ...final];
      }
      fullData.push({
        ...anime,
        episodes: episodes,
      });
    }
    fs.writeFile(__dirname + "/full.json", JSON.stringify(fullData), () => {});
  })();
});

//console.table(data.slice(0, 10));
