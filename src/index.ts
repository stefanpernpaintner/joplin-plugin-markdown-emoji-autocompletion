import joplin from 'api';
import {ContentScriptType} from "../api/types";

joplin.plugins.register({
    onStart: async function () {


        const contentScriptId = 'de-pernpas-joplin-markdown-emoji-autocomplete';

        joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            contentScriptId,
            './markdownEmojiAutocompleteScript.js', // JS file is built from src/contentScript.ts
        );
    },
});