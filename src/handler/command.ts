import * as vscode from 'vscode';
import { TokenInfo } from '../service/codeParser';
import { renderMarkdownToPreview } from '../service/markdownRender';
import { MatchResult, stringConverterManager } from '../service/stringConverter';
import { strconvMemFileSystemProvider } from './memfs';
import { StringConverterConvertResult } from '../service/stringConverter/interface';
import { PositionEvent } from '../service/type';
import { fixStringConverterConvertResult } from '../service/vscode';


export async function strconvCodeActionShowMarkdown(token: TokenInfo, matchResult: MatchResult, position: PositionEvent, convertResult?: StringConverterConvertResult) {
    const { meta } = matchResult;
    if (!convertResult) {
        convertResult = stringConverterManager.convert(token, matchResult);
    }
    const uri = strconvMemFileSystemProvider.createUri(`${meta.name}.md`);
    convertResult = await fixStringConverterConvertResult(convertResult, position);
    const markdownContent = renderMarkdownToPreview({token, matchResult, convertResult, vscodeUriScheme: vscode.env.uriScheme}, position);

    strconvMemFileSystemProvider.update(uri, markdownContent);
    await vscode.commands.executeCommand('markdown.showPreviewToSide', uri, {});
    await vscode.commands.executeCommand('markdown.preview.refresh', uri, {});
}

export async function strconvClipboardWriteString(str: string) {
    await vscode.env.clipboard.writeText(str);
    await vscode.window.showInformationMessage('Copied to clipboard');
}

export async function strconvSymbolRenameTo(position: PositionEvent, newSymbolName: string) {

    const workspaceEdit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
        'vscode.executeDocumentRenameProvider',
        vscode.Uri.parse(position.uri), // 当前文档的 URI
        new vscode.Position(position.line, position.character),     // 当前光标位置（用于确定要重命名的符号）
        newSymbolName, // 用户提供的最终新名称
    );

    if (workspaceEdit && workspaceEdit.size > 0) {
        // 应用计算出来的编辑操作
        const success = await vscode.workspace.applyEdit(workspaceEdit);
        if (success) {
            vscode.window.showInformationMessage(`Renmae symbol to \`${newSymbolName}\` success`);
        } else {
            vscode.window.showErrorMessage('Renmae symbol to \`${newSymbolName}\` failed');
        }
    } else {
        await vscode.window.showWarningMessage(`The language not active language server or not support symbol renaming.`);
    }

}
