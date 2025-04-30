import * as vscode from 'vscode';


export function showTextCommandCallback() {
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
}

export function helloWorldCommandCallback() {
    vscode.window.showInformationMessage('Hello World from String Converter in a web extension host!');
}

export function getCodeActionProviderCallback(): vscode.CodeActionProvider {
    return {
        provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) {
            const action = new vscode.CodeAction('Convert String', vscode.CodeActionKind.Refactor);
            action.command = {
                command: 'string-converter.showText',
                title: 'Convert Selected Text'
            };
            return [action];
        }
    };
}