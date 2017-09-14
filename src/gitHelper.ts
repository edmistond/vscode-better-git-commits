import * as simpleGit from "simple-git";
import * as _ from "lodash";

export class gitHelper {
  private repositoryDirectory: string;
  private sGit: any;

  constructor(workingDir: string) {
    this.repositoryDirectory = workingDir;
    this.sGit = new simpleGit(this.repositoryDirectory);
  }

  status() {
    let git = this.sGit;
    return new Promise(function(resolve, reject) {
      git.status(function(err, status) {
        if (err) return reject(err);
        return resolve(status);
      });
    });
  }

  commit(message: string) {
    let git = this.sGit;
    let parsedMessage: string[] = message.split("\n");
    if (parsedMessage.length > 1) {
      parsedMessage = _.filter(parsedMessage, function(m: string) {
        return !m.startsWith("#");
      });
    }
    return new Promise(function(resolve, reject) {
      git.commit(parsedMessage, function(err, result) {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  }
}
