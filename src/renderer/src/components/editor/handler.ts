import { useWorkerFactory } from "monaco-editor-wrapper/workerFactory";
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { initServices as initVscodeServices } from 'monaco-languageclient/vscode/services';
import * as monaco from 'monaco-editor';

export class FileEditor {


    static async init() {
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
        await initWebSocketAndStartClient('ws://localhost:30000/sampleServer');
        monaco.languages.register({
            id: 'json',
            extensions: ['.json', '.jsonc'],
            aliases: ['JSON', 'json'],
            mimetypes: ['application/json']
        });
    }


    editor: monaco.editor.IStandaloneCodeEditor

    constructor(element: HTMLElement, options: {
        value: string,
        uri: string,
    }) {

        const value = `{
        "$schema": "http://json.schemastore.org/coffeelint",
        "line_endings": "unix"
    }`
        const language = 'json'
        const uri = monaco.Uri.file('/test/file.json')
        this.editor = monaco.editor.create(element, {
            model: monaco.editor.createModel(value,language,uri),
            automaticLayout: true,
            wordBasedSuggestions: 'off'
        });
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

function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
    return new MonacoLanguageClient({
        name: 'Sample Language Client',
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['json'],
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



const runClient = async (element: HTMLElement
) => {

    // register the JSON language with Monaco


    // create monaco editor

};


const initWebSocketAndStartClient = (url: string) => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = () => {
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = createLanguageClient({
            reader,
            writer
        });
        languageClient.start();
        reader.onClose(() => languageClient.stop());
    };
    return webSocket;
}