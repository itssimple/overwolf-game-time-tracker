/// <reference path="log.js" />

var firstLaunch = true;

function openWindow(event) {
    if(event && event.origin == 'overwolfstartlaunchevent') {
        return;
    }
    overwolf.windows.obtainDeclaredWindow('mainWindow', (result) => {
        if(result.status !== 'success') {
            return;
        }

        overwolf.windows.restore(result.window.id);
    });
}

function gameLaunched(game) {
    log('[GAMELAUNCH]', game);
}

function gameInfoUpdated(game) {
    log('[GAMEINFO]', game);
}

if(firstLaunch) {
    log('[INIT]', 'Initializing all event handlers and getting all the recent played games (to see if we missed anything)');
    firstLaunch = false;

    overwolf.extensions.onAppLaunchTriggered.removeListener(openWindow);
    overwolf.extensions.onAppLaunchTriggered.addListener(openWindow);

    overwolf.games.onGameLaunched.removeListener(gameLaunched);
    overwolf.games.onGameLaunched.addListener(gameLaunched);

    overwolf.games.onGameInfoUpdated.removeListener(gameInfoUpdated);
    overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdated);

    log('[INIT]', 'All eventhandlers have been set');
}

