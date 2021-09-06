// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { fstat } = require('fs');
const vscode = require('vscode');
const { getCitationInfo, convertToBib, saveBibEntry } = require('./src/getBibEntry');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "doi-adder" is now active!');


	let disposable = vscode.commands.registerCommand('doi-adder.doiAdd', async function () {

		let doi = await vscode.window.showInputBox({
			title: 'Enter DOI or URL',
		});
		let bibPromise = getCitationInfo(doi)
			.catch(err => vscode.window.showErrorMessage(err))
			.then(citationInfo => convertToBib(citationInfo));

		let path = await vscode.window.showInputBox({
			title: 'Bib File Location',
			value: 'references.bib'
		});

		await bibPromise.catch(err => vscode.window.showErrorMessage(err)).then(bib => saveBibEntry(bib, path));

	  vscode.window.showInformationMessage('Bib Info Added To File');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
