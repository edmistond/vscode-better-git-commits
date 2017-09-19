# bettergitcommits

This is a commit message editor for Visual Studio Code, inspired by Magit for
Emacs. I personally like to be able to put in detailed commit messages, and the
small textbox for entering them in Visual Studio Code's native Git interface
discourages this.

This extension operates in a very straightforward way - on running the 'Show Git
Commit Editor' command, it will create a new commit message in your temporary
directory, load the file, and switch the active editor to it. You enter your
commit message, then execute 'Run Git Commit' and it will save the file (if you
haven't already) and execute a git commit -F specifying your temporary file as
the source of the message.

If you want to install locally without using the VS Marketplace, you can clone
it into your `~/.vscode/extensions` directory, then run `npm install` and `npm
compile`.

Currently, no keyboard shortcuts are bound so as to avoid stepping on any
existing ones. You may bind whichever shortcuts you prefer to
`bettercommits.showCommitScreen` and `bettercommits.executeCommit`.

The extension activates when the Show Commit Editor command is run. Executing a
commit should only work against a `git-commit` language buffer. If no files are
staged or no message is supplied, the commit operation will abort. Unlike the
built-in Git interface, it _will not_ automatically stage files if none were
staged.