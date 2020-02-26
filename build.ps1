Push-Location .\appcfg-settings
npm install
tsc
Pop-Location
tfx extension create --manifest-globs .\appcfg-settings-extension.json

Push-Location .\cscfg-settings
npm install
tsc
Pop-Location
tfx extension create --manifest-globs .\cscfg-settings-extension.json

Push-Location .\cscfg-vnetsite
npm install
tsc
Pop-Location
tfx extension create --manifest-globs .\cscfg-vnetsite-extension.json
