# 📽️ Vibe

Video streaming app powered by Google Drive, Electron, React and Mpv.js (libmpv).

#### Require: Authentication with a Google Drive Account 

Why?
- To use Google Drive API for downloading/streaming videos
- To take advantage of Google Drive overpowered CDN
- To bypass Google Drive file download limitation, the app will copy the file into the user's Google Drive account. 

#### Video Demo
[![Watch the video](https://i3.ytimg.com/vi/rOwC3sjhumI/mqdefault.jpg)](https://youtu.be/rOwC3sjhumI)

#### Try it out
Windows - [Download 64-bit](https://github.com/pownthep/Vibe/releases/download/v1.0-beta.1/vibe-win32-x64.zip) - Extract the zip and open the Vibe.exe

Mac - Soon (when I have access to a Mac). In the meantime, you try it by:
```sh
git clone https://github.com/pownthep/Vibe.git
cd Vibe
npm install
# Install mpv library - video player
brew install mpv
```

Linux - Soon (when I have access to a Mac). In the meantime, you try it by:
```sh
git clone https://github.com/pownthep/Vibe.git
cd Vibe
npm install
# Install mpv library - video player
apt-get install libmpv1 libavformat-dev
```