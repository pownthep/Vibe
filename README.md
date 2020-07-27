![alt text](https://github.com/pownthep/Vibe-Android/blob/master/app/src/main/res/mipmap-hdpi/ic_launcher_round.png "Logo Title Text 1") 

Video streaming app powered by Google Drive, Electron, React and Mpv.js (libmpv).

#### Perks
- HEVC encoded video = lower bandwidth usage and higher quality videos
- One of the best CDN in world = No random buffering and up to 1 Gbps download speed (I've tested it with my internet)
- One of the most powerful video player (MPV) on the market = Play pretty much any video format available on Earth
- Free

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
