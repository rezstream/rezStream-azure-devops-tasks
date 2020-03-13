This extension will update a Cloud Config cscfg file from variables that match each Setting element's name attribute.
The XML updates will be applied to the file using a DOM library instead of token replacement, so values such as `&` will be escaped for you by this tool.
Your formatting and line breaks will probably be butchered 🤷.
Real simple, nothing fancy.