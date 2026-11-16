import {CodeMirrorControl} from "../api/types";
import {Completion, CompletionContext, CompletionResult, CompletionSource} from '@codemirror/autocomplete';
import {emojiKeyToUnicodeMapping} from "./defaultEmojis";

export default (context: { contentScriptId: string, postMessage: any }) => {
    return {
        // An `async` was also added so that we can `await` the result of
        // `context.postMessage`:
        plugin: async (codeMirrorWrapper: CodeMirrorControl) => {
            console.info('content script loaded');

            // Get the setting from the main plugin via postMessage
            const triggerCharacter = await context.postMessage('getTriggerCharacter');
            console.info(`trigger character loaded: ${triggerCharacter}`);

            const emojisCompletionList: Completion[] = Object.entries(emojiKeyToUnicodeMapping).map(([key, unicode]) => {
                const codePoints = unicode.split('-').map(hex => parseInt(hex, 16));
                const emoji = String.fromCodePoint(...codePoints);
                return {
                    label: `${triggerCharacter}${key}${triggerCharacter}${emoji}`,
                    apply: emoji,
                };
            });

            // Inspired by https://code.haverbeke.berlin/codemirror/autocomplete/src/commit/main/src/completion.ts#L179
            const completionSource: CompletionSource = (ctx: CompletionContext): CompletionResult | null => {
                // We search for a match
                const word = ctx.matchBefore(/\w+$/);

                // We return null if no match found
                if (word === null && !ctx.explicit) {
                    return null;
                }

                return {
                    from: word.from,
                    options: emojisCompletionList.map((completion): Completion => ({
                        ...completion,
                        // We want exact matches to be displayed on top
                        boost: completion.label.includes(word.text) ? 1 : 0,
                    })),
                    validFor: /\w*$/,
                };
            };

            codeMirrorWrapper.addExtension([
                codeMirrorWrapper.joplinExtensions.completionSource(
                    completionSource
                ),

                // Joplin also exposes a Facet that allows enabling or disabling CodeMirror's
                // built-in autocompletions. These apply, for example, to HTML tags.
                codeMirrorWrapper.joplinExtensions.enableLanguageDataAutocomplete.of(true),
            ]);
        },
    };
};