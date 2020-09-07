require("v8-compile-cache");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { getPluginEntry } = require("mpv.js");

let os;
switch (process.platform) {
  case "darwin":
    os = "mac";
    break;
  case "win32":
    os = "win";
    break;
}

const pdir = path.join(__dirname, "mpv", os);

// See pitfalls section for details.
if (process.platform !== "linux") {
  process.chdir(pdir);
}
// Fix for latest Electron.
app.commandLine.appendSwitch("no-sandbox");
// To support a broader number of systems.
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("register-pepper-plugins", getPluginEntry(pdir));

let win;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1560,
    height: 760,
    titleBarStyle: "hidden",
    frame: false,
    backgroundColor: "#303030",
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, "preload.js"),
    },
    // icon:
    //   process.platform !== "darwin"
    //     ? path.join(__dirname, "assets/icon.ico")
    //     : path.join(__dirname, "assets/icon.icns"),
  });

  win.setMenuBarVisibility(false);

  if (process.env.DEV) {
    require(__dirname + "/server/server.js");
    win.loadURL("http://localhost:3000");
  } else {
    require(__dirname + "/server/server.bundle.js");
    win.loadFile(path.join(__dirname, "/build/index.html"));
  }
  win.webContents.setAudioMuted(true);

  win.once("ready-to-show", () => {});
}

app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) createWindow();
});
