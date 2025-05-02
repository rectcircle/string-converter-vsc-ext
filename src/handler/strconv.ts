import * as vscode from 'vscode';
import { extractCodeTokens, TokenInfo } from '../service/codeParser';
import { MatchResult, stringConverterManager } from '../service/stringConverter';
import { strconvMemFileSystem } from './memfs';
import { StringConverterConvertResult, StringConverterMeta } from '../service/stringConverter/interface';


function renderMarkdown(token: TokenInfo, meta: StringConverterMeta, result: StringConverterConvertResult): string {
    
    const codeBlockToken = '```';
    let markdownContent = `# ${meta.name}`;

    if (result.error) {
        markdownContent += `\n\n## Error\n\n${result.error}`;
        return markdownContent;
    }

    markdownContent +=`\n\n## Result\n\n${codeBlockToken}${meta.resultLanguageId}\n${result.result}\n${codeBlockToken}`;

    if (result.explain) {
        markdownContent += `\n\n## Explain\n\n${result.explain}`;
    }

    if (meta.specInfo) {
        if (meta.specInfo.url) {
            const idx = meta.specInfo.referenceLinks?.findIndex(link => {
                return link.url === meta?.specInfo?.url;
            });
            if (idx !== undefined && idx !== -1) {
                markdownContent += `\n\n## ${meta.specInfo.name}  [^${idx+1}]`;
            } else {
                markdownContent += `\n\n## [${meta.specInfo.name}](${meta.specInfo.url})`;
            }
        } else {
            markdownContent += `\n\n## ${meta.specInfo.name}`;
        }
        markdownContent += `\n\n### Description\n\n${meta.specInfo.description}`;
        if (meta.specInfo.referenceLinks) {
            markdownContent += `\n\n### Reference Links\n\n${meta.specInfo.referenceLinks.map((link, index) => {
                return `[^${index+1}]: [${link.title}](${link.url})[^${index+1}]`;
            }).join('\n')}`;
        }
    }
    return markdownContent;
}

export async function showTextCommandCallback(token: TokenInfo, matchResult: MatchResult) {
    const { meta } = matchResult;
    const result = stringConverterManager.convert(token, matchResult);
    const uri = strconvMemFileSystem.createUri(`${meta.name}.md`);

    const markdownContent = renderMarkdown(token, meta, result);

    strconvMemFileSystem.update(uri, markdownContent);
    await vscode.commands.executeCommand('markdown.showPreviewToSide', uri, {});
    await vscode.commands.executeCommand('markdown.preview.refresh', uri, {});
}

type CodeActionWithData = vscode.CodeAction & { 
    data: { 
        token: TokenInfo,
        matchResult: MatchResult,
    } 
};

export function getCodeActionProviderCallback(): vscode.CodeActionProvider<CodeActionWithData> {
    return {
        provideCodeActions: async (document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) => {
            const codeContent = document.getText();
            const startOffset = document.offsetAt(range.start);
            let endOffset: number | undefined;
            let selectionText: string | undefined;
            if (!range.isEmpty) {
                selectionText = document.getText(range);
                endOffset = document.offsetAt(range.end);
            }
            const tokens = extractCodeTokens(codeContent, document.languageId, startOffset, endOffset, selectionText);
            
            return tokens.flatMap(token => {
                return stringConverterManager.match(token).map(matchResult => {
                    const action = new vscode.CodeAction(matchResult.meta.name, vscode.CodeActionKind.Refactor) as CodeActionWithData;
                    action.data = { token, matchResult };
                    return action;
                });
            });
        },
        resolveCodeAction: async (action: CodeActionWithData, token: vscode.CancellationToken) => {
            action.command = {
                command: 'string-converter.showText',
                title: 'Convert Selected Text',
                arguments: [action.data.token, action.data.matchResult],
            };
            return action;
        }
    };
}
