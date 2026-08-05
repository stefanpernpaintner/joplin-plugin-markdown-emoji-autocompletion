import {CodeMirrorControl} from "../api/types";
import {CompletionSource} from '@codemirror/autocomplete';
import {emojiKeyToUnicodeMapping} from "./defaultEmojis";

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default (context: { contentScriptId: string, postMessage: any }) => {
    return {
        // An `async` was also added so that we can `await` the result of
        // `context.postMessage`:
        plugin: async (codeMirrorWrapper: CodeMirrorControl) => {

            console.info('content script loaded');

            // Get the setting from the main plugin via postMessage
            const triggerCharacter = await context.postMessage('getTriggerCharacter');
            console.info(`trigger character loaded: ${triggerCharacter}`);

            const completionOptions = Object.entries(emojiKeyToUnicodeMapping).map(([key, unicode]) => {
                const codePoints = unicode.split('-').map(hex => parseInt(hex, 16));
                const emoji = String.fromCodePoint(...codePoints);
                return {
                    label: `${triggerCharacter}${key}${triggerCharacter}${emoji}`,
                    apply: emoji,
                };
            });

            const escapedTrigger = escapeRegex(triggerCharacter);
            // match any non-trigger/whitespace character after the trigger
            const matchRegex = new RegExp(`${escapedTrigger}[^${escapedTrigger}\\s]+$`);

            const source: CompletionSource = (ctx) => {
                const token = ctx.matchBefore(matchRegex);
                if (!token) return null;
                return {
                    from: token.from,
                    options: completionOptions,
                    validFor: matchRegex,
                };
            };

            codeMirrorWrapper.addExtension([
                codeMirrorWrapper.joplinExtensions.completionSource(source),

                // Joplin also exposes a Facet that allows enabling or disabling CodeMirror's
                // built-in autocompletions. These apply, for example, to HTML tags.
                codeMirrorWrapper.joplinExtensions.enableLanguageDataAutocomplete.of(true),
            ]);

        },
    };
};