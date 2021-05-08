Remove-Item .\game-time-tracker.opk, .\game-time-tracker.zip -ErrorAction Ignore
Write-Output "Compressing new version into archive, please hold on"
Compress-Archive -Path .\manifest.json,.\resources,.\windows -DestinationPath .\game-time-tracker.zip
Rename-Item .\game-time-tracker.zip .\game-time-tracker.opk
Write-Output "New OPK generated"