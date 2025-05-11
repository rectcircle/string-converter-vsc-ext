import { TokenInfo } from './codeParser';
import { MatchResult } from './stringConverter';
import { StringConverterConvertResult } from './stringConverter/interface';
import { PositionEvent } from './type';


export interface MarkdownRenderParam {
    token: TokenInfo;
    matchResult: MatchResult;
    convertResult: StringConverterConvertResult;
    vscodeUriScheme: string;
}

const CodeBlockMarker = '```';

export function renderMarkdownToPreview(param: MarkdownRenderParam, position: PositionEvent): string {
    const { matchResult: {meta}, convertResult: result} = param;
    let markdownContent = `# ${meta.name}`;

    if (result.error) {
        markdownContent += `\n\n## Error\n\n${result.error}`;
        return markdownContent;
    }

    // 实现复制按钮
    // ❌ 方案 1： 直接使用 a 链接， vscode 安全机制禁用了。
    // markdownContent += `\n\n## Result <a href="#result-%F0%9F%93%8B" onclick="alert('hello')">📋</a>\n\n${CodeBlockMarker}${meta.resultLanguageId}\n${result.result}\n${CodeBlockMarker}`;
    // ❌ 方案 2： 尝试利用自己的 memfs 加 track 逻辑。没有实现。
    // markdownContent += `\n\n## Result [📋](./Parse-the-JWT-String/copy)\n\n${CodeBlockMarker}${meta.resultLanguageId}\n${result.result}\n${CodeBlockMarker}`;
    // ❌ 方案 3: 尝试类似于 hover MarkdownString 的 `command:xxx` 机制，不支持。
    // ✅ 方案 4: 利用 vscode:// 机制。
    // trick: ( 符号也需要转义 %28 因为 markdown 遇到 ( 会解析异常。
    // trick: ) 符号也需要转义 %29 因为 markdown 遇到 ) 会意外闭合。
    if (typeof result.result === 'string') {
        const args = encodeURIComponent(JSON.stringify([result.result])).replace(/\(/g, '%28').replace(/\)/g, '%29');
        markdownContent += `\n\n## Result [📋](${param.vscodeUriScheme}://rectcircle.str-conv/clipboard.writeString?${args})\n\n${CodeBlockMarker}${meta.resultLanguageId}\n${result.result}\n${CodeBlockMarker}`;
    } else {
        markdownContent += `\n\n## Result\n\n`;
        for (let item of result.result) {
            let itemResult = item.result;
            if (itemResult.includes('\n')) {
                itemResult = JSON.stringify(itemResult);
            }
            const args = encodeURIComponent(JSON.stringify([position, itemResult])).replace(/\(/g, '%28').replace(/\)/g, '%29');
            markdownContent += `- \`${itemResult}\``;
            for (let action of item.actions || []) {
                if (action === 'copy') {
                    markdownContent += ` [📋](${param.vscodeUriScheme}://rectcircle.str-conv/clipboard.writeString?${args})`;
                } else if (action ==='rename') {
                    markdownContent += ` [📝](${param.vscodeUriScheme}://rectcircle.str-conv/symbol.renameTo?${args})`;
                }
            }
            markdownContent += '\n';
        }
    }

    if (result.explain) {
        markdownContent += `\n\n## Explain\n\n${result.explain}`;
    }

    if (meta.specInfo) {
        if (meta.specInfo.url) {
            const idx = meta.specInfo.referenceLinks?.findIndex(link => {
                return link.url === meta?.specInfo?.url;
            });
            if (idx !== undefined && idx !== -1) {
                markdownContent += `\n\n## ${meta.specInfo.name}  <sup>[[${idx + 1}]](#reference_links_${idx + 1})</sup>`;
            } else {
                markdownContent += `\n\n## [${meta.specInfo.name}](${meta.specInfo.url})`;
            }
        } else {
            markdownContent += `\n\n## ${meta.specInfo.name}`;
        }
        markdownContent += `\n\n### Description\n\n${meta.specInfo.description}`;
        if (meta.specInfo.referenceLinks) {
            markdownContent += `\n\n### Reference Links\n\n${meta.specInfo.referenceLinks.map((link, index) => {
                return `${index + 1}. [${link.title}](${link.url}) <a href="#reference_links_${index + 1}" id="reference_links_${index + 1}" >↩︎</a>`;
            }).join('\n')}`;
        }
    }
    return markdownContent;
}

export function renderMarkdownToHover(params: MarkdownRenderParam[], position: PositionEvent): string {
    let markdownParts: string[] = [];

    for (const param of params) {
        const { token, matchResult, convertResult: result} = param;

        // 示例 command:_typescript.openJsDocLink?[{"file":{"path":"/Users/bytedance/Workspace/rectcircle/str-conv-vsc-ext/node_modules/@types/vscode/index.d.ts","scheme":"file"},"position":{"line":2961,"character":1}}]
        // trick: ( 符号也需要转义 %28 因为 markdown 遇到 ( 会解析异常。
        // trick: ) 符号也需要转义 %29 因为 markdown 遇到 ) 会意外闭合。
        let markdownContent = '';
        const showMarkdownArgs = encodeURIComponent(JSON.stringify([token, matchResult, position, result])).replace(/\(/g, '%28').replace(/\)/g, '%29');
        if (typeof result.result ==='string') {
            const args = encodeURIComponent(JSON.stringify([result.result])).replace(/\(/g, '%28').replace(/\)/g, '%29');
            markdownContent += `### ${matchResult.meta.name} [$(copy)](command:str-conv.clipboard.writeString?${args}) [$(open-editors-view-icon)](command:str-conv.codeAction.showMarkdown?${showMarkdownArgs})`;
            markdownContent += `\n\n${CodeBlockMarker}${matchResult.meta.resultLanguageId}\n${result.result}\n${CodeBlockMarker}`;
        } else {
            markdownContent += `### ${matchResult.meta.name} [$(open-editors-view-icon)](command:str-conv.codeAction.showMarkdown?${showMarkdownArgs})`;
            markdownContent += `\n\n`;
            for (let item of result.result) {
                let itemResult = item.result;
                if (itemResult .includes('\n')) {
                    itemResult  = JSON.stringify(itemResult );
                }
                const args = encodeURIComponent(JSON.stringify([position, itemResult])).replace(/\(/g, '%28').replace(/\)/g, '%29');
                markdownContent += `- \`${itemResult }\``;
                for (let action of item.actions || []) {
                    if (action === 'copy') {
                        markdownContent += ` [$(copy)](command:str-conv.clipboard.writeString?${args})`;
                    } else if (action === 'rename') {
                        markdownContent += ` [$(find-replace-all)](command:str-conv.symbol.renameTo?${args})`;
                    }
                }
                
                markdownContent += '\n';
            }
        }
        if (result.explain) {
            markdownContent += `\n\n${result.explain}`;
        }
        markdownParts.push(markdownContent);
    }

    return markdownParts.join("\n\n---\n\n");
}