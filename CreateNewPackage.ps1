Remove-Item .\game-time-tracker.opk, .\game-time-tracker.zip -ErrorAction Ignore
Write-Output "Compressing new version into archive, please hold on"
#Compress-Archive -Path .\manifest.json,.\resources,.\windows -DestinationPath .\game-time-tracker.zip
7z a -tzip .\game-time-tracker.opk -r @package-source.lst
Write-Output "New OPK generated"