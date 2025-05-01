// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showTextCommandCallback, getCodeActionProviderCallback } from '../handler/strconv';
import Prism from 'prismjs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const testCodeText= `// 如下: hello world 可以快速获取
console.log('hello world'); 
// 如下: hello 无法快速获取，需要触发后处理
console.log(\`hello \${'world'} 
haha\`);
function test() {
    console.log('hello world');
}
`;

	const prismjsTokens = Prism.tokenize(testCodeText, Prism.languages.typescript);
	console.log(prismjsTokens);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "string-converter" is now active in the web extension host!');

	const showTextCommand = vscode.commands.registerCommand('string-converter.showText', showTextCommandCallback);

	const codeActionProvider = vscode.languages.registerCodeActionsProvider('*', getCodeActionProviderCallback());

	context.subscriptions.push(showTextCommand, codeActionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() { }
