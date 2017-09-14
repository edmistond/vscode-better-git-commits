import * as git from "simple-git";

export class gitHelper {
  private repositoryDirectory: string;

  constructor(workingDir: string) {
    this.repositoryDirectory = workingDir;
  }

  public status() {
    return new Promise(function(resolve, reject) {
      git.status(function(err, status) {
        if (err) return reject(err);
        return resolve(status);
      });
    });
  }

  public commit(message: string) {
    let parsedMessage:string[] = message.split("\n");
    return new Promise(function(resolve ,reject) {
      git.commit(parsedMessage, function(err, result) {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  }
}
