import * as vscode from 'vscode';

class StrconvMemFileSystem implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private contentMap = new Map<string, string>();

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri, content: string) {
        this.contentMap.set(uri.toString(), content);
        this._onDidChange.fire(uri);
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.contentMap.get(uri.toString()) || '';
    }

    public createUri(path: string): vscode.Uri {
        return vscode.Uri.parse(`strconvmemfile:${path}`);
    }
}

export const strconvMemFileSystemProvider = new StrconvMemFileSystem();
export const SCHEME = 'strconvmemfile';
