// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "string-converter" is now active in the web extension host!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const showTextCommand = vscode.commands.registerCommand('string-converter.showText', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found');
			return;
		}

		const selection = editor.selection;
		let text = editor.document.getText(selection);

		if (!text) {
			const wordRange = editor.document.getWordRangeAtPosition(selection.active);
			text = wordRange ? editor.document.getText(wordRange) : 'No text found';
		}

		vscode.window.showInformationMessage(`Selected text: ${text}`);
	});

	const disposable = vscode.commands.registerCommand('string-converter.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from String Converter in a web extension host!');
	});

	const codeActionProvider = vscode.languages.registerCodeActionsProvider('*', {
		provideCodeActions(document, range, context, token) {
			const action = new vscode.CodeAction('Convert String', vscode.CodeActionKind.Refactor);
			action.command = {
				command: 'string-converter.showText',
				title: 'Convert Selected Text'
			};
			return [action];
		}
	});

	context.subscriptions.push(disposable, codeActionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
