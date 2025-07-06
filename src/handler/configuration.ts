import * as vscode from 'vscode';
import { stringConverterManager } from '../service/stringConverter';
import { StringConverterTriggerSource } from '../service/stringConverter/interface';


export async function onDidChangeConfigurationHandler(event?: vscode.ConfigurationChangeEvent) {
    if (event === undefined ||  event.affectsConfiguration("str-conv.trigger")) {
        const triggerConfig = vscode.workspace.getConfiguration("str-conv.trigger");
        const hoverTriggerIDs = triggerConfig.get<string[]>("hover") || [];
        const codeActionTriggerIDs = triggerConfig.get<string[]>("codeAction") || [];
        const idTriggersMap = new Map<string, StringConverterTriggerSource[]>();
        hoverTriggerIDs.forEach(id => {
            idTriggersMap.set(id, [...idTriggersMap.get(id) || [], "hover"]);
        });
        codeActionTriggerIDs.forEach(id => {
            idTriggersMap.set(id, [...idTriggersMap.get(id) || [], "codeAction"]);
        });
        for (const [id, triggers] of idTriggersMap) {
            stringConverterManager.setSupportTriggerSources(id, triggers);
        }
    }
}
