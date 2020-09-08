const { remote, shell } = require("electron");
const fs = require("fs");

window.remote = remote;
window.openExternal = shell.openExternal;
window.openPath = shell.openPath;
window.directory = __dirname;
window.access = fs.access;
window.electron = true;
window.os = process.platform;
