import { promises as fsPromises } from 'fs';
import * as path from 'path';

abstract class HelpFilesManager {
  private static topicNodeMap: Record<string, unknown> = {};

  public static getTopicNodesMap() {
    return this.topicNodeMap;
  }

  public static async initialize(directory: string) {
    await this.processFileOrDirectory(directory);
  }

  private static async processFileOrDirectory(fname: string) {
    let stat = null;
    try {
      stat = await fsPromises.lstat(fname);
    } catch(error) {
      console.warn(error);
    }

    if(!stat) {
      return;
    }

    if (stat.isFile()) {
      if (fname.endsWith(".html")) {
        await this.processDocumentFile(fname);
      }
    } else {
      const files = await fsPromises.readdir(fname);
      const promises = [];
      files.forEach(async (fileName) => {
        promises.push(this.processFileOrDirectory(fname + "/" + fileName));
      });
      await Promise.all(promises);
    }
  }

  private static async processDocumentFile(fname : string) {
    const buffer = await fsPromises.readFile(fname);
    if(buffer) {
      const contents = buffer.toString();
      const matches = contents.matchAll(/<A[ \t]+ID="([^"]*)"/g);
      for (const match of matches) {
        this.topicNodeMap[match[1]]=path.basename(fname);
      }
    }
  }
}

export { HelpFilesManager }