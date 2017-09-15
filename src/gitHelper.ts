import * as simpleGit from "simple-git";

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

  commit(message: string[]) {
    let git = this.sGit;

    return new Promise(function(resolve, reject) {
      git.commit(message, function(err, result) {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  }
}
