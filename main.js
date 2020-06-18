require("v8-compile-cache");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { getPluginEntry } = require("mpv.js");
const url = require('url');

// Absolute path to the plugin directory.
const pluginDir = path.join(
  path.dirname(require.resolve("mpv.js")),
  "build",
  "Release"
);
// See pitfalls section for details.
if (process.platform !== "linux") {
  process.chdir(pluginDir);
}
// Fix for latest Electron.
app.commandLine.appendSwitch("no-sandbox");
// To support a broader number of systems.
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch(
  "register-pepper-plugins",
  getPluginEntry(pluginDir)
);

let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1560,
    height: 720,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
      nodeIntegration: true
    },
    show: false,
    icon: path.join(__dirname, "app_icon.ico"),
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "/build/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  win.once("ready-to-show", () => {
    win.show();
  });
}

app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) createWindow()
});

const server = require("./server/server.bundle.js");

