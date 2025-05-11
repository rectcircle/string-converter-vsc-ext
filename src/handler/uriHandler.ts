import * as vscode from 'vscode';
import { strconvClipboardWriteString, strconvSymbolRenameTo } from './command';

export const strconvUriHandler: vscode.UriHandler = {
    handleUri(uri) {
        if (uri.path === '/clipboard.writeString') {
            const args = JSON.parse(uri.query);
            // 判断 args 是否是数组
            if (Array.isArray(args) && args.length === 1 && typeof args[0] === 'string') {
                strconvClipboardWriteString(args[0]);
            }
        } else if (uri.path === '/symbol.renameTo') {
            const args = JSON.parse(uri.query);
            // 判断 args 是否是数组
            if (Array.isArray(args) && args.length === 2 &&
                typeof args[0] === 'object' && 
                typeof args[0].line === 'number' &&
                typeof args[0].character === 'number' &&
                typeof args[1] === 'string') {
                strconvSymbolRenameTo(args[0], args[1]);
            }
        }
    }
};
