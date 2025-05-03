import * as vscode from 'vscode';
import { TokenInfo } from '../service/codeParser';
import { renderMarkdownToPreview } from '../service/markdownRender';
import { MatchResult, stringConverterManager } from '../service/stringConverter';
import { strconvMemFileSystemProvider } from './memfs';
import { StringConverterConvertResult } from '../service/stringConverter/interface';


export async function strconvCodeActionShowMarkdown(token: TokenInfo, matchResult: MatchResult , convertResult?: StringConverterConvertResult) {
    const { meta } = matchResult;
    if (!convertResult) {
        convertResult = stringConverterManager.convert(token, matchResult);
    }
    const uri = strconvMemFileSystemProvider.createUri(`${meta.name}.md`);

    const markdownContent = renderMarkdownToPreview({token, matchResult, convertResult, vscodeUriScheme: vscode.env.uriScheme});

    strconvMemFileSystemProvider.update(uri, markdownContent);
    await vscode.commands.executeCommand('markdown.showPreviewToSide', uri, {});
    await vscode.commands.executeCommand('markdown.preview.refresh', uri, {});
}

export async function strconvClipboardWriteString(str: string) {
    await vscode.env.clipboard.writeText(str);
    await vscode.window.showInformationMessage('Copied to clipboard');
}
