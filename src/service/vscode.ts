import * as vscode from 'vscode';
import { StringConverterConvertResult } from './stringConverter/interface';
import { PositionEvent, RangeOffset } from './type';


export async function canRename(positionEvent: PositionEvent): Promise<undefined | RangeOffset> {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(positionEvent.uri));
    const position = new vscode.Position(positionEvent.line, positionEvent.character);
    // 实测: 默认情况会返回 TextMate 在当前位置的符号，除非有 lsp 另有实现。
    const result = await vscode.commands.executeCommand<vscode.Range | {placeholder: string, range: vscode.Range}>(
        'vscode.prepareRename',
        document.uri,
        position
    );
    if (!result) {
        return undefined;
    }
    const range = result instanceof vscode.Range ? result : result.range;
    return {
        startOffset: document.offsetAt(range.start),
        endOffset: document.offsetAt(range.end),
    };
}

export async function fixStringConverterConvertResult(convertResult: StringConverterConvertResult,  positionEvent: PositionEvent): Promise<StringConverterConvertResult> {
    if (!Array.isArray(convertResult.result)) {
        return convertResult;
    }
    // 未来可以做一些修正
    return convertResult;
}
