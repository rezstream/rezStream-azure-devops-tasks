This extension will update appSettings and connectionStrings within one .NET XML config file from variables that match each elements key or name attribute.
The XML updates will be applied to the file using a DOM library instead of token replacement, so values such as `&` will be escaped for you by this tool.
Your formatting and line breaks will probably be butchered 🤷.
Real simple, nothing fancy.