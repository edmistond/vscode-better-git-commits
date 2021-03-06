"use strict";
import * as vscode from "vscode";
import {
  Disposable,
  TextDocument,
  Position,
  TextEditor,
  Selection
} from "vscode";
import { gitHelper } from "./gitHelper";
import os = require("os");
import fs = require("fs");
import path = require("path");

function getStagedFiles(files) {
  let stagedFiles: any = files.filter(file => file.index !== " ");
  return stagedFiles;
}

function parseStatusInfo(statusSummary: any): string {
  let result: string = "\n\n";
  result += "# Add a commit message here! \n#\n";
  result += `# Current branch: ${statusSummary.current}\n#\n`;

  let stagedFiles: any = getStagedFiles(statusSummary.files);

  if (stagedFiles.length === 0) {
    return result;
  }

  result += `# Staged files:\n`;
  stagedFiles.forEach(sf => {
    result += `#    ${sf.path}\n`;
  });

  return result;
}

function getTmpFilePath(): string {
  return path.normalize(path.join(os.tmpdir(), "COMMIT_EDITMSG"));
}

function deleteTmpFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, err => {
      if (err) reject();
      resolve();
    });
  });
}

async function createTmpFile(filePath: string, contents: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, contents, err => {
      if (err) {
        console.log(`Error writing temp file: ${err}`);
        reject(err);
      }
      resolve();
    });
  });
}

async function showCommitScreen() {
  let gh = new gitHelper(vscode.workspace.rootPath);
  let status: any;
  try {
    status = await gh.status();
    console.log(status);
  } catch (e) {
    console.log(e);
    await vscode.window.showErrorMessage("Error getting git status.");
    return;
  }

  let commitMessageTempFilePath: string = getTmpFilePath();
  // TODO: add this back in after I work out how to select and delete the status info lines...
  // let commitMessageContents: string = parseStatusInfo(status);

  await createTmpFile(commitMessageTempFilePath, "");

  let commitDisplay = await vscode.workspace.openTextDocument(
    commitMessageTempFilePath
  );

  let document: TextEditor = await vscode.window.showTextDocument(
    commitDisplay
  );

  // Set a selection with no actual range to move the cursor to the top of the file.
  const position: Position = new Position(0, 0);
  document.selections = [new Selection(position, position)];
}

async function executeCommit() {
  let activeDocument: TextDocument = vscode.window.activeTextEditor.document;

  if (activeDocument.languageId !== "git-commit") {
    return vscode.window.showErrorMessage(
      "Current buffer is not a git commit message."
    );
  }

  let commitMessage: string[] = activeDocument.getText().split("\n");

  if (commitMessage.every(line => line === "")) {
    return vscode.window.showErrorMessage(
      "You have not supplied a commit message!"
    );
  }

  let gh = new gitHelper(vscode.workspace.rootPath);
  let status: any = await gh.status();

  if (getStagedFiles(status.files).length === 0) {
    return vscode.window.showErrorMessage("No files are currently staged.");
  }

  // Since we `git commit -F` using the tempfile, need to save our work.
  await activeDocument.save();
  
  let commitResult: any;
  try {
    commitResult = await gh.commitRaw(activeDocument.fileName);
  } catch (e) {
    await vscode.window.showErrorMessage(
      "Error running commit, please see output console."
    );
    console.log(e);
    return;
  }

  await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
}

export function activate(context: vscode.ExtensionContext) {
  let showCommitCmd: Disposable = vscode.commands.registerCommand(
    "bettercommits.showCommitScreen",
    showCommitScreen
  );

  let execCommitCmd: Disposable = vscode.commands.registerCommand(
    "bettercommits.executeCommit",
    executeCommit
  );

  context.subscriptions.push(showCommitCmd);
  context.subscriptions.push(execCommitCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {}
