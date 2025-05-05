// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { strconvClipboardWriteString, strconvCodeActionShowMarkdown } from '../handler/command';
import { strconvCodeActionProvider } from '../handler/codeAction';
import { strconvMemFileSystemProvider, SCHEME } from '../handler/memfs';
import { strconvHoverProvider } from '../handler/hoverProvider';
import { strconvUriHandler } from '../handler/uriHandler';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "str-conv" is now active in the web extension host!');

	const codeActionShowMarkdownCommand = vscode.commands.registerCommand('str-conv.codeAction.showMarkdown', strconvCodeActionShowMarkdown);

	const clipboardWriteStringCommand = vscode.commands.registerCommand('str-conv.clipboard.writeString', strconvClipboardWriteString);

	// const codeActionProvider = vscode.languages.registerCodeActionsProvider('*', strconvCodeActionProvider);

	const contentProvider = vscode.workspace.registerTextDocumentContentProvider(SCHEME, strconvMemFileSystemProvider);

	const hoverProvider = vscode.languages.registerHoverProvider("*", strconvHoverProvider);

	const uriHandler = vscode.window.registerUriHandler(strconvUriHandler);

	context.subscriptions.push(
		codeActionShowMarkdownCommand, 
		clipboardWriteStringCommand, 
		// codeActionProvider, 
		contentProvider, 
		hoverProvider, 
		uriHandler
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
