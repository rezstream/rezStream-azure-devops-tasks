Push-Location .\cscfg-transform
npm install
tsc
Pop-Location

Push-Location .\cscfg-vnetsite
npm install
tsc
Pop-Location

tfx extension create --manifest-globs vss-extension.json
