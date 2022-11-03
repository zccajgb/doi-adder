// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { getCitationInfo, convertToBib, saveBibEntry } = require('./getBibEntry');
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
			title: 'Enter DOI or URL TEST',
		});

		let bibPromise = getCitationInfo(doi)
			.catch(err => vscode.window.showErrorMessage(err))
			.then(citationInfo => convertToBib(citationInfo, doi));

		let path = await vscode.window.showInputBox({
			title: 'Bib File Location',
			value: 'references.bib'
		});

		await bibPromise
			.then(bib => saveBibEntry(bib, path, doi))
			.catch(err => {
					vscode.window.showErrorMessage(err);
			})
			.then(() => vscode.window.showInformationMessage('Bib Info Added To File'));
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
