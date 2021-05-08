# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
