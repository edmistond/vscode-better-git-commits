"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Disposable, TextDocument } from "vscode";
import { gitHelper } from "./gitHelper";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

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

  let commitMessage: string[] = activeDocument.getText().split("\n");
  commitMessage = commitMessage.filter(line => !line.startsWith("#"));

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

  let commitResult: any;
  try {
    commitResult = await gh.commit(commitMessage);
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
