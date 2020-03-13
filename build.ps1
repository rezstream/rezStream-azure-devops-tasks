Push-Location .\appcfg-settings
try {
  npm install
  tsc
}
finally {
  Pop-Location
}
tfx extension create --manifest-globs .\appcfg-settings-extension.json

Push-Location .\cscfg-settings
try {
  npm install
  tsc
}
finally {
  Pop-Location
}
tfx extension create --manifest-globs .\cscfg-settings-extension.json

Push-Location .\cscfg-vnetsite
try {
  npm install
  tsc
}
finally {
  Pop-Location
}
tfx extension create --manifest-globs .\cscfg-vnetsite-extension.json
