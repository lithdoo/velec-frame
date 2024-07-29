import * as monaco from 'monaco-editor';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { initServices as initVscodeServices } from 'monaco-languageclient/vscode/services';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getFileServiceOverrride from '@codingame/monaco-vscode-files-service-override'
import { MonacoLanguageClient } from 'monaco-languageclient';
import { markRaw } from 'vue'
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import './ts-highlight-0.0.1.vsix'


const install = async () => {
    await configureMonacoWorkers()
    await initVscodeServices({
        serviceConfig: {
            userServices: {
                ...getFileServiceOverrride(),
                ...getThemeServiceOverride(),
                ...getTextmateServiceOverride(),
            },
            debugLogging: true,
        }
    });

    await initWebSocketAndStartClient('ws://localhost:30001/typescript', ['typescript']);
    await initWebSocketAndStartClient('ws://localhost:30001/json', ['json']);
    await initWebSocketAndStartClient('ws://localhost:30001/sql', ['sql'], (client) => {
        client.sendRequest('workspace/configuration', {
            connections: [{
                "name": "sqlite3-project",
                "adapter": "sqlite3",
                "filename": "/Users/joe-re/src/sql-language-server/packages/server/test.sqlite3",
                "projectPaths": ["/Users/joe-re/src/sqlite2_project"]
            }]
        })
    });

    monaco.languages.register({
        id: 'typescript',
        extensions: ['.ts', '.tsx'],
        aliases: ['Typescript', 'ts'],
        // mimetypes: ['application/json']
    });

    monaco.languages.register({
        id: 'sql',
        extensions: ['.sql'],
        // mimetypes: ['application/json']
    });
}

setTimeout(() => {
    install()
}, 1000)


export class TextEditorHandler {

    content: string = ''
    editor?: monaco.editor.IStandaloneCodeEditor
    lang: string
    constructor(content: string, lang: string) {
        this.lang = lang
        this.content = content
    }


    protected createModel(): {
        value: string, language?: string, uri?: monaco.Uri
    } {
        const language = this.lang
        const content = this.content
        return { language, value: content }
    }

    initEditor(element: HTMLElement) {
        const { value, language, uri } = this.createModel()
        console.log({ model: this.createModel() })
        this.editor = markRaw(monaco.editor.create(element, {
            model: monaco.editor.createModel(value, language, uri),
            automaticLayout: true,
            wordBasedSuggestions: 'off'
        }))
    }

    setContent(content: string) {
        this.content = content
        this.editor?.setValue(this.content)
    }

    destory() {
        this.editor?.getModel()?.dispose()
        this.editor?.dispose()
    }
}



export class FileEditorHandler extends TextEditorHandler {
    url: string
    constructor(url: string, lang: string) {
        super('', lang)
        this.url = url
    }

    createModel() {
        const model = super.createModel()
        const uri = monaco.Uri.parse(this.url)
        return { ...model, uri }
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

const initWebSocketAndStartClient = (url: string, languageIds: string[], cb?: (client: MonacoLanguageClient) => void) => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = () => {
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = createLanguageClient({
            reader,
            writer
        }, languageIds);
        languageClient
        languageClient.start();
    
        if (cb) {
            cb(languageClient)
        }
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
            },
            workspaceFolder: `C:\\Users\\mini\\Documents\\GitHub\\velec-frame`
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            }
        }
    });
};