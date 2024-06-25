import * as monaco from 'monaco-editor';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { initServices as initVscodeServices } from 'monaco-languageclient/vscode/services';
import { markRaw } from 'vue';

export class FileEditorHandler {

    static async install() {
        await configureMonacoWorkers()
        await initVscodeServices({
            serviceConfig: {
                userServices: {
                    // ...getThemeServiceOverride(),
                    // ...getTextmateServiceOverride(),
                },
                debugLogging: true,
            }
        });
    }


    content: string = ''
    editor?: monaco.editor.IStandaloneCodeEditor
    lang: string
    url: string
    constructor(url: string, lang: string) {
        this.lang = lang
        this.url = url
    }

    initEditor(element: HTMLElement) {
        const uri = monaco.Uri.file(this.url)
        const language = this.lang
        const content = this.content
        this.editor = markRaw(monaco.editor.create(element, {
            model: monaco.editor.createModel(content, language, uri),
            automaticLayout: true,
            wordBasedSuggestions: 'off'
        }))
    }

    setContent(content: string) {
        this.content = content
        this.editor?.setValue(this.content)
    }
}

FileEditorHandler.install()


function configureMonacoWorkers() {
    useWorkerFactory({
        ignoreMapping: true,
        workerLoaders: {
            editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
        }
    });
};
