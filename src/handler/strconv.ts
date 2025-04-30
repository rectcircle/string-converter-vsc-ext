import * as vscode from 'vscode';

export async function quickGetActiveText(activeEditor: vscode.TextEditor, selection: vscode.Selection): Promise<string | undefined> {
    let text: string | undefined;
    if (!selection.isEmpty) {
        text = activeEditor.document.getText(selection);
    }

    if (!text) {
        const highlights = await vscode.commands.executeCommand<vscode.DocumentHighlight[]>(
            'vscode.executeDocumentHighlights',
            activeEditor.document.uri,
            selection.active
        );

        if (highlights?.length) {
            text = activeEditor.document.getText(highlights[0].range);
        }
    }
    return text;
}

export async function showTextCommandCallback(activeEditor: vscode.TextEditor, selection: vscode.Selection, text?: string) {
    // 快速获取活跃的字符串
    if (!text) {
        text = await quickGetActiveText(activeEditor, selection);
    }

    if (!text && activeEditor.document.languageId === 'typescript') {
        const originalSelection = new vscode.Selection(selection.start, selection.end);
        
        for (let i = 0; i < 3; i++) {
            await vscode.commands.executeCommand('editor.action.smartSelect.expand');
            const newSelection = activeEditor.selection;
            const newText = activeEditor.document.getText(newSelection);
            
            if (newText && (newText.startsWith(`'`) && newText.endsWith(`'`) || 
                             newText.startsWith(`"`) && newText.endsWith(`"`) || 
                             newText.startsWith('`') && newText.endsWith('`'))) {
                text = newText;
                break;
            }
        }
        // 恢复原始选择
        activeEditor.selection = originalSelection;
    }

    if (!text) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(`Selected text: ${text}`);
        }
        const wordRange = activeEditor.document.getWordRangeAtPosition(selection.active);
        text = wordRange ? activeEditor.document.getText(wordRange) : undefined;
    }
    
    if (text) {
        vscode.window.showInformationMessage(`Selected text: ${text}`);
    }
}

type CodeActionWithData = vscode.CodeAction & { 
    data: { 
        activeEditor: vscode.TextEditor,
        selection: vscode.Selection,
        text?: string,
    } 
};

export function getCodeActionProviderCallback(): vscode.CodeActionProvider<CodeActionWithData> {
    return {
        provideCodeActions: async (document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return [];
            }
            const selection = activeEditor.selection;
            const text = await quickGetActiveText(activeEditor, selection);
            // TODO: 直接调用识别器。
            const action = new vscode.CodeAction(`Convert String${text?' (quickGetTextFinish)':''}`, vscode.CodeActionKind.Refactor) as CodeActionWithData;
            action.data = { text, activeEditor, selection };
            return [action];
        },
        resolveCodeAction: async (action: CodeActionWithData, token: vscode.CancellationToken) => {
            action.command = {
                command: 'string-converter.showText',
                title: 'Convert Selected Text',
                arguments: [action.data.activeEditor, action.data.selection, action.data.text],
            }
            return action;
        }
    };
}
