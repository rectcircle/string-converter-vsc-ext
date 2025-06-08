import * as vscode from 'vscode';
import { extractCodeTokens, TokenInfo } from '../service/codeParser';
import { MatchResult, stringConverterManager } from '../service/stringConverter';
import { PositionEvent } from '../service/type';
import { StringConverterConvertResult } from '../service/stringConverter/interface';

export type CodeActionWithData = vscode.CodeAction & {
    data: {
        token: TokenInfo;
        matchResult: MatchResult;
        position: PositionEvent;
        convertResult?: StringConverterConvertResult;
    };
};


export const strconvCodeActionProvider: vscode.CodeActionProvider<CodeActionWithData | vscode.CodeAction> = {
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
                return stringConverterManager.match(token, {
                    triggerSource: 'codeAction',
                }).map(matchResult => {
                    const action = new vscode.CodeAction(matchResult.meta.name, vscode.CodeActionKind.Empty) as CodeActionWithData;
                    action.data = { token, matchResult, position: positionEvent };
                    return action;
                });
            }).flatMap(action => {
                // 如果有 expandAction
                // 先执行一次 convert。
                // 如果包含 rename 动作，那么则直接展平返回 rename 动作到 codeaction 列表。
                if (action.data.matchResult.meta.expandAction) {
                    let convertResult = stringConverterManager.convert(action.data.token, action.data.matchResult);
                    if (Array.isArray(convertResult.result)) {
                        let newActions = convertResult.result
                            .filter(item => item?.actions?.includes('rename'))
                            .map(item => {
                                let newAction = new vscode.CodeAction(`Rename the symbol to ${item.result}`, vscode.CodeActionKind.Refactor);
                                newAction.command = {
                                    command: 'str-conv.symbol.renameTo',
                                    title: `Rename the symbol to ${item.result}`,
                                    arguments: [action.data.position, item.result]
                                };
                                return newAction;
                        });
                        if (newActions.length > 0) {
                            return newActions;
                        } else {
                            action.data.convertResult = convertResult;
                        }
                    }
                }
                return [action];
            });
        },
        resolveCodeAction: async (action: CodeActionWithData, token: vscode.CancellationToken) => {
            if (action.data) {
                action.command = {
                    command: 'str-conv.codeAction.showMarkdown',
                    title: action.data.matchResult.meta.name,
                    arguments: [action.data.token, action.data.matchResult, action.data.position]
                };
            }
            return action;
        }
};
