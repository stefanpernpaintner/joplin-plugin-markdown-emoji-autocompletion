import {CodeMirrorControl} from "../api/types";
import {completeFromList} from '@codemirror/autocomplete';
import {emojiKeyToUnicodeMapping} from "./defaultEmojis";

export default (context: { contentScriptId: string, postMessage: any }) => {
    return {
        // An `async` was also added so that we can `await` the result of
        // `context.postMessage`:
        plugin: async (codeMirrorWrapper: CodeMirrorControl) => {

            console.info('content script loaded');

            const completionSource = Object.entries(emojiKeyToUnicodeMapping).map(([key, unicode]) => {
                const codePoints = unicode.split('-').map(hex => parseInt(hex, 16));
                const emoji = String.fromCodePoint(...codePoints);
                return {
                    label: `:${key}:` + emoji,
                    apply: emoji,
                };
            });

            codeMirrorWrapper.addExtension([
                codeMirrorWrapper.joplinExtensions.completionSource(
                    completeFromList(completionSource)
                ),

                // Joplin also exposes a Facet that allows enabling or disabling CodeMirror's
                // built-in autocompletions. These apply, for example, to HTML tags.
                codeMirrorWrapper.joplinExtensions.enableLanguageDataAutocomplete.of(true),
            ]);

        },
    };
};