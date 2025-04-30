import * as vscode from 'vscode';


export async function showTextCommandCallback() {
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

    const highlights = await vscode.commands.executeCommand<vscode.DocumentHighlight[]>(
        'vscode.executeDocumentHighlights',
        editor.document.uri,
        selection.active
    );
    
    let highlightText = '';
    if (highlights && highlights.length > 0) {
        highlightText = editor.document.getText(highlights[0].range);
    }
    const highlightInfo = highlights ? `Highlights count: ${highlights.length}${highlightText ? `, First highlight text: ${highlightText}` : ''}` : 'No highlights found';
    vscode.window.showInformationMessage(`Selected text: ${text}\n${highlightInfo}`);
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
