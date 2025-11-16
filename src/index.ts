import joplin from 'api';
import {ContentScriptType, SettingItemType} from "../api/types";

export const SETTING_TRIGGER_CHARACTER = 'settingTriggerCharacter';

joplin.plugins.register({
    onStart: async function () {

        const section = 'markdownEmojiAutocompleteSection';
        const contentScriptId = 'de-pernpas-joplin-markdown-emoji-autocomplete';

        await joplin.settings.registerSection(section, {
            label: 'Markdown Emoji Autocomplete',
            iconName: 'fas fa-smile'
        });

        await joplin.settings.registerSettings({
            [SETTING_TRIGGER_CHARACTER]: {
                value: ':',
                type: SettingItemType.String,
                section: section,
                public: true,
                label: 'Enable Emoji Autocomplete on Character',
                description: 'Specifies the character that triggers emoji autocomplete. Note: The pop-up appears after typing the first character, so using a frequently used character like ":" may disrupt regular typing.',
            },
        });

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            contentScriptId,
            './markdownEmojiAutocompleteScript.js', // JS file is built from src/contentScript.ts
        );

        // Handle messages from the content script
        await joplin.contentScripts.onMessage(contentScriptId, async (message: string) => {
            if (message === 'getTriggerCharacter') {
                return await joplin.settings.value(SETTING_TRIGGER_CHARACTER) ?? ':';
            }
        });
    },
});