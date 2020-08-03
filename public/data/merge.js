const fs = require("fs");
const util = require("util");

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

(async () => {
  try {
    const json = await readFile("merged.json");
    const data = JSON.parse(json);
    for (const item of data) {
      fs.writeFile(
        __dirname + "/shows/" + item.id + ".json",
        JSON.stringify(item),
        () => {}
      );
    }
    const trimmed = data.map(i => ({
      id: i.id,
      name: i.name,
      poster: i.poster
    }))
    fs.writeFile("trimmed.json", JSON.stringify(trimmed), () =>{});
    const trimmedDesktop = data.map(i => ({
      id: i.id,
      name: i.name,
      poster: i.poster,
      banner: i.banner,
      keywords: i.keywords
    }))
    fs.writeFile("trimmed-desktop.json", JSON.stringify(trimmedDesktop), () =>{});
  } catch (error) {}
})();
