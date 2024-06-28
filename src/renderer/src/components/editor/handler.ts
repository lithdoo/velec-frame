import * as monaco from 'monaco-editor';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { initServices as initVscodeServices } from 'monaco-languageclient/vscode/services';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { markRaw } from 'vue';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-json-default-extension';
import '@codingame/monaco-vscode-sql-default-extension';
import '@codingame/monaco-vscode-javascript-default-extension';

export class FileEditorHandler {
    static {
        setTimeout(() => {
            FileEditorHandler.install()
        }, 1000)
    }

    static async install() {
        await configureMonacoWorkers()
        await initVscodeServices({
            serviceConfig: {
                userServices: {
                    ...getThemeServiceOverride(),
                    ...getTextmateServiceOverride(),
                },
                debugLogging: true,
            }
        });

        await initWebSocketAndStartClient('ws://localhost:30001/typescript',['typescript']);
        await initWebSocketAndStartClient('ws://localhost:30001/json',['json']);
        monaco.languages.register({
            id: 'typescript',
            extensions: ['.ts', '.tsx'],
            aliases: ['Typescript', 'ts'],
            // mimetypes: ['application/json']
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
        const uri = monaco.Uri.parse(this.url)
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




function configureMonacoWorkers() {
    useWorkerFactory({
        ignoreMapping: true,
        workerLoaders: {
            editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
        }
    });
};

const initWebSocketAndStartClient = (url: string, languageIds: string[]) => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = () => {
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = createLanguageClient({
            reader,
            writer
        }, languageIds);
        languageClient.start();
        reader.onClose(() => languageClient.stop());
    };
    return webSocket;
}


function createLanguageClient(transports: MessageTransports, languageIds: string[]): MonacoLanguageClient {
    return new MonacoLanguageClient({
        name: 'Sample Language Client',
        clientOptions: {
            // use a language id as a document selector
            documentSelector: languageIds,
            // disable the default error handler
            errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart })
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            }
        }
    });
};