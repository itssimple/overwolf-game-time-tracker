# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.2](https://github.com/itssimple/overwolf-game-time-tracker/compare/v1.1.1...v1.1.2) (2021-06-13)


### Bug Fixes

* Stop opening just because you have devtools ([fb8cc91](https://github.com/itssimple/overwolf-game-time-tracker/commit/fb8cc915e5a5caa9781e714674881f3b731ddaa7))

### [1.1.1](https://github.com/itssimple/overwolf-game-time-tracker/compare/v1.1.0...v1.1.1) (2021-06-12)


### Bug Fixes

* Safety harness for shutting down games ([035c508](https://github.com/itssimple/overwolf-game-time-tracker/commit/035c508335f045d7ccaa357003b1bef2817c70e4))

## [1.1.0](https://github.com/itssimple/overwolf-game-time-tracker/compare/v0.0.7...v1.1.0) (2021-06-12)


### Features

* Add total time tracker ([6f6392e](https://github.com/itssimple/overwolf-game-time-tracker/commit/6f6392e5687f60ab69ef85191a6b83de932777aa))
* Added generateUUID to give detected sessions a unique sessionId ([bb51090](https://github.com/itssimple/overwolf-game-time-tracker/commit/bb5109085657efad1dfdb52b05b079c8b71c8c2c))
* Added help-method to pluralize things ([b335728](https://github.com/itssimple/overwolf-game-time-tracker/commit/b335728d9ebb71594e3652be4dd4cf8e599b958e))
* Added styling for settings and the new thin titlebar ([180c444](https://github.com/itssimple/overwolf-game-time-tracker/commit/180c444f7af02d25362c15e658d30f221202aeeb))
* Added tray icon/menu support, added more code to load supported OW games. ([b77ad28](https://github.com/itssimple/overwolf-game-time-tracker/commit/b77ad28407562a718915c005e06aa97cc27e3f94))
* Adding preparing work for the settings page ([9450a29](https://github.com/itssimple/overwolf-game-time-tracker/commit/9450a299b354a0e3d4a2e9f7d22f311bc076aa90))
* Changed how we call newGameSession (to be able to differentiate from OW-games and possible games) ([0d92c02](https://github.com/itssimple/overwolf-game-time-tracker/commit/0d92c02b4c690431cfe875c36adbb2171f0794ce))
* Functional settings for game tracking in background (Not shutting down) ([5b5b48d](https://github.com/itssimple/overwolf-game-time-tracker/commit/5b5b48d64ce1b14fc86833cc649feb3847df7197))
* Tracking other games than Overwolf supports! ([1ba14c2](https://github.com/itssimple/overwolf-game-time-tracker/commit/1ba14c22c2dc51d3a705764f667aa6ca27b16989))


### Bug Fixes

* Ability to stop monitoring/logging time if you close the game ([db89af4](https://github.com/itssimple/overwolf-game-time-tracker/commit/db89af4e2f70779bb480b7ac33dee16574ef63f6))
* Add support for days in the 7 days title counter. ([760eda5](https://github.com/itssimple/overwolf-game-time-tracker/commit/760eda51b3eee30aa2ddd575ca94b75c69878456))
* Updated GameDetector to handle a few bugfixes ([1b6319d](https://github.com/itssimple/overwolf-game-time-tracker/commit/1b6319d6d115980b7d74f76d93341abcd99c1b59))
* Updated plugin to have correct GameInfo from API ([4fccb88](https://github.com/itssimple/overwolf-game-time-tracker/commit/4fccb888c5906db16b423b91de50989810ee283d))

### [0.0.7](https://github.com/itssimple/overwolf-game-time-tracker/compare/v0.0.6...v0.0.7) (2021-05-08)


### Features

* Game summary window, now showing all your sessions ([11c4e1b](https://github.com/itssimple/overwolf-game-time-tracker/commit/11c4e1b62b616c590f877e9036e5cdd0a103d3eb))


### Bug Fixes

* Fixes overflow for game summary, so that we get the scrollbar in the correct position. ([d6d5b01](https://github.com/itssimple/overwolf-game-time-tracker/commit/d6d5b0164f051dc93fe7e4cb5eacfcb2cad07712))

### 0.0.6 (2021-05-08)


### Features

* Added logging method for ease of stuff. ([ce1679a](https://github.com/itssimple/overwolf-game-time-tracker/commit/ce1679aaf00908e1a86770f94beb695e2982ef76))
* Added main window (not very much fun to look at right now) ([87d6b2d](https://github.com/itssimple/overwolf-game-time-tracker/commit/87d6b2d5f75787f6e18035ea9dd5dab21ecb608a))
* Added the background window. With event handlers to handle events for game launches and info updates (and app triggers) ([6aa13a0](https://github.com/itssimple/overwolf-game-time-tracker/commit/6aa13a0e5388e9b7a3bb043df8b3a061a45f9c18))
* Added the last GUI-updates (except graph) ([ce7fb44](https://github.com/itssimple/overwolf-game-time-tracker/commit/ce7fb44032098089b94f4738b170805602c86947))
* Added titlebar (draggable), remade the launcher icon ([50350fc](https://github.com/itssimple/overwolf-game-time-tracker/commit/50350fc3c2fac2c42958a91b99a1cc68631bbbf4))
* Enough to load it unpacked, and background is loading ([30f6a90](https://github.com/itssimple/overwolf-game-time-tracker/commit/30f6a907381e4f8f978198a88910edaff0017619))
* EventEmitter, Database ([6ec503d](https://github.com/itssimple/overwolf-game-time-tracker/commit/6ec503defe019cfff8373d373e9f72989f8d956f))
* Fixed detection of Teamfight Tactics ([e35c284](https://github.com/itssimple/overwolf-game-time-tracker/commit/e35c284556c2b8c88e992e4264ae9db052f4a551))
* Fixed everything for version 0.0.1 and QA ([6451abd](https://github.com/itssimple/overwolf-game-time-tracker/commit/6451abdeab75f53d70589f0ca38406873d16c437))
* Fixed the graph that shows the hours played ([ed72919](https://github.com/itssimple/overwolf-game-time-tracker/commit/ed72919d356a2d12d30bde8db0247a7cf2364448))


### Bug Fixes

* Changed so that we group game starts by gameTitle instead ([821dda2](https://github.com/itssimple/overwolf-game-time-tracker/commit/821dda26735505cc154f9db913c6c552bbfe69bf))
* End sessions that are not ended on launch fixes [#6](https://github.com/itssimple/overwolf-game-time-tracker/issues/6) ([e9ba74c](https://github.com/itssimple/overwolf-game-time-tracker/commit/e9ba74ca5eeabddc2145e93a7ab523b97db57fc5))
* Launch from desktop now properly detected. ([b4eccd8](https://github.com/itssimple/overwolf-game-time-tracker/commit/b4eccd8bb1c5d3ee1a3ce3a36128cf2ce8cc1385))
* More launch events supported. also fixed minimum-overwolf-version to the correct one. ([8f525b1](https://github.com/itssimple/overwolf-game-time-tracker/commit/8f525b1450420b20b552b19c47370d5d81601d33))
* Only emit events if we have data available ([efbd810](https://github.com/itssimple/overwolf-game-time-tracker/commit/efbd810559cc54e71666427bae97b97346921efa))
* Save end date continously. fixes [#3](https://github.com/itssimple/overwolf-game-time-tracker/issues/3) ([d293af2](https://github.com/itssimple/overwolf-game-time-tracker/commit/d293af2a48a6eb1babfafd766ef66f61c78133b9))
* **Monitoring:** Fixed issue with logging sessions based on gamelaunchevent ([7f55eea](https://github.com/itssimple/overwolf-game-time-tracker/commit/7f55eea4afb5c32b4e27f4072797da1b00f6e60c))
