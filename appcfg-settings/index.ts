import tl = require('azure-pipelines-task-lib/task');
import { promises as fsPromises } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

async function run() {
  try {
    const targetFilePath: string | undefined = tl.getInput('targetFilePath', true);
    if (targetFilePath === '' || targetFilePath == null) {
      tl.setResult(tl.TaskResult.Failed, 'A file path to transform is required');
      return;
    }

    let fileMutated = false;

    const originalContents = await fsPromises.readFile(targetFilePath, 'utf8');
    const parser = new DOMParser();
    
    let doc = parser.parseFromString(originalContents, 'text/xml');
    let rootNode = doc.documentElement;
    if (rootNode.nodeName.toUpperCase() !== 'CONFIGURATION') {
      tl.setResult(tl.TaskResult.Failed, 'Config file missing root configuration element');
      return;
    }

    const overrideNode = function(node: Node, nameKey: string, valueKey: string) {
      let element = <Element>node;
      const settingName = element.getAttribute(nameKey);
      if (!settingName) {
        return;
      }

      let overrideValue = tl.getVariable(settingName);

      if (overrideValue != null) {
        tl.debug(`Override found for ${settingName}`);
        element.setAttribute(valueKey, overrideValue);
        fileMutated = true;
      }
    };

    let appSettingsNode = Array.from(rootNode.childNodes).filter(n => n.nodeType === 1 && n.nodeName.toUpperCase() === 'APPSETTINGS')[0];
    if (appSettingsNode) {
      Array.from(appSettingsNode.childNodes)
        .filter(n => n.nodeType === 1 && n.nodeName.toUpperCase() === 'ADD')
        .forEach(n => overrideNode(n, 'key', 'value'));
    }

    let connStrNode = Array.from(rootNode.childNodes).filter(n => n.nodeType === 1 && n.nodeName.toUpperCase() === 'CONNECTIONSTRINGS')[0];
    if (connStrNode) {
      Array.from(connStrNode.childNodes)
        .filter(n => n.nodeType === 1 && n.nodeName.toUpperCase() === 'ADD')
        .forEach(n => overrideNode(n, 'name', 'connectionString'));
    }

    if (fileMutated) {
      const newContents = new XMLSerializer().serializeToString(doc);
      await fsPromises.writeFile(targetFilePath, newContents);
    }
    else {
      tl.warning("No variable updates were applied to the file.");
    }

  }
  catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
