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

    const overrideName: string | undefined = tl.getInput('overrideNetworkSiteName', true);
    if (overrideName == null) {
      tl.setResult(tl.TaskResult.Failed, 'An override name is required');
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

    let networkNode = doc.documentElement.getElementsByTagName('NetworkConfiguration')[0];
    if (!networkNode) {
      networkNode = doc.createElement('NetworkConfiguration');
      doc.documentElement.appendChild(networkNode);
      fileMutated = true;
    }

    let virtualNetworkSite = networkNode.getElementsByTagName('VirtualNetworkSite')[0];
    if (!virtualNetworkSite) {
      virtualNetworkSite = doc.createElement('VirtualNetworkSite');
      networkNode.appendChild(virtualNetworkSite);
      fileMutated = true;
    }

    const originalName = virtualNetworkSite.getAttribute('name');
    if (originalName !== overrideName) {
      virtualNetworkSite.setAttribute('name', overrideName);
      fileMutated = true;
    }

    if (fileMutated) {
      const newContents = new XMLSerializer().serializeToString(doc);
      await fsPromises.writeFile(targetFilePath, newContents);
    }
    else {
      tl.warning("No updates were applied to the file.");
    }

  }
  catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
