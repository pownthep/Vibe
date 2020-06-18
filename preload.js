const { remote, shell } = require("electron");
const Store = require("electron-store");

window.remote = remote;
window.store = Store;
window.shell = shell;
