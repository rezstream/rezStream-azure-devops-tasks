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
    if (doc.documentElement.nodeName !== 'ServiceConfiguration') {
      tl.setResult(tl.TaskResult.Failed, 'Config file missing root ServiceConfiguration element');
      return;
    }

    let roleNode = Array.from(doc.documentElement.childNodes).filter(n => n.nodeType === 1 && n.nodeName === 'Role')[0];
    if (!roleNode) {
      tl.setResult(tl.TaskResult.Failed, 'Config file missing Role element');
      return;
    }

    let configSettingsNode = Array.from(roleNode.childNodes).filter(n => n.nodeType === 1 && n.nodeName === 'ConfigurationSettings')[0];
    if (!configSettingsNode) {
      tl.warning("Failed to find a ConfigurationSettings section to update");
      return;
    }

    Array.from(configSettingsNode.childNodes).filter(n => n.nodeType === 1 && n.nodeName === 'Setting').forEach(settingsNode => {
      let settingsElement = <Element>settingsNode;
      const settingName = settingsElement.getAttribute('name');
      if (!settingName) {
        return;
      }

      let overrideValue = tl.getVariable(settingName);

      if (overrideValue != null) {
        tl.debug(`Override found for ${settingName}`);
        settingsElement.setAttribute('value', overrideValue);
        fileMutated = true;
      }
    });

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
