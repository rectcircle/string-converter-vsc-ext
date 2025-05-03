import * as vscode from 'vscode';
import { strconvClipboardWriteString } from './command';

export const strconvUriHandler: vscode.UriHandler = {
    handleUri(uri) {
        if (uri.path === '/clipboard.writeString') {
            const args = JSON.parse(uri.query);
            // 判断 args 是否是数组
            if (Array.isArray(args) && args.length === 1 && typeof args[0] === 'string') {
                strconvClipboardWriteString(args[0]);
            }
        }
    }
}