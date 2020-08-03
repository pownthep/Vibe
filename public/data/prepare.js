const fs = require("fs");

// fs.readFile("new.json", (err, content) => {
//   if (err) return;
//   const formatted = JSON.parse(content).map((i, index) => {
//     return {
//       id: 183 + index,
//       name: "",
//       banner: "",
//       rating: 0,
//       desc: "",
//       keywords: "",
//       poster: "",
//       episodes: [i],
//     };
//   });
//   fs.writeFile("temp.json", JSON.stringify(formatted), () => {});
// });

fs.readFile("temp.json", (err, content) => {
  if (err) return;
  const formatted = JSON.parse(content).map((i, index) => {
    return {
      ...i,
      type: "movie",
      episodes: [{ ...i.episodes[0], name: i.name }],
    };
  });
  fs.writeFile("temp.json", JSON.stringify(formatted), () => {});
});
