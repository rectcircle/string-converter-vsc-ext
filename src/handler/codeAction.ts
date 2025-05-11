import * as vscode from 'vscode';
import { extractCodeTokens, TokenInfo } from '../service/codeParser';
import { MatchResult, stringConverterManager } from '../service/stringConverter';
import { PositionEvent } from '../service/type';

export type CodeActionWithData = vscode.CodeAction & {
    data: {
        token: TokenInfo;
        matchResult: MatchResult;
        position: PositionEvent;
    };
};


export const strconvCodeActionProvider: vscode.CodeActionProvider<CodeActionWithData> = {
        provideCodeActions: async (document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) => {
            const codeContent = document.getText();
            const startOffset = document.offsetAt(range.start);
            let endOffset: number | undefined;
            let selectionText: string | undefined;
            if (!range.isEmpty) {
                selectionText = document.getText(range);
                endOffset = document.offsetAt(range.end);
            }
            const positionEvent = {
                line: range.start.line,
                character: range.start.character,
                uri: document.uri.toString(),
            };
            const tokens = await extractCodeTokens(codeContent, document.languageId, startOffset, endOffset, selectionText, positionEvent);
            return tokens.flatMap(token => {
                return stringConverterManager.match(token).map(matchResult => {
                    const action = new vscode.CodeAction(matchResult.meta.name, vscode.CodeActionKind.Refactor) as CodeActionWithData;
                    action.data = { token, matchResult, position: positionEvent };
                    return action;
                });
            });
        },
        resolveCodeAction: async (action: CodeActionWithData, token: vscode.CancellationToken) => {
            action.command = {
                command: 'str-conv.codeAction.showMarkdown',
                title: action.data.matchResult.meta.name,
                arguments: [action.data.token, action.data.matchResult, action.data.position]
            };
            return action;
        }
};
