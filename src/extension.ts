"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Disposable, TextDocument } from "vscode";
import { gitHelper } from "./gitHelper";
import * as _ from "lodash";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function getStagedFiles(files) {
  let stagedFiles: any = _.filter(files, function(f: any) {
    return f.index !== " ";
  });

  return stagedFiles;
}

function parseStatusInfo(statusSummary: any): string {
  let result: string = "\n\n";
  result += "# Add a commit message here! \n#\n";
  result += `# Current branch: ${statusSummary.current}\n#\n`;

  let stagedFiles:any = getStagedFiles(statusSummary.files);

  if (stagedFiles.length === 0) {
    return result;
  }

  result += `# Staged files:\n`;
  _.each(stagedFiles, function(sf: any) {
    result += `#    ${sf.path}\n`;
  });

  return result;
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

  let commitDisplay: TextDocument = await vscode.workspace.openTextDocument({
    content: parseStatusInfo(status),
    language: "git-commit"
  });

  await vscode.window.showTextDocument(commitDisplay);
}

async function executeCommit() {
  let activeDocument: TextDocument = vscode.window.activeTextEditor.document;

  if (activeDocument.languageId !== "git-commit") {
    return vscode.window.showErrorMessage(
      "Current buffer is not a git commit message."
    );
  }

  let commitMsg = activeDocument.getText();
  // TODO: move commit message splitting to this fn and check for empty lines

  let gh = new gitHelper(vscode.workspace.rootPath);
  let status:any = await gh.status();
  
  if (getStagedFiles(status.files).length === 0) {
    return vscode.window.showErrorMessage("No files are currently staged.");
  }
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
