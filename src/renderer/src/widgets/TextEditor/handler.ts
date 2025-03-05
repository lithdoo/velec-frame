import * as monaco from 'monaco-editor'
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory'
import { initServices as initVscodeServices } from 'monaco-languageclient/vscode/services'
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc'
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getFileServiceOverrride from '@codingame/monaco-vscode-files-service-override'
import { MonacoLanguageClient } from 'monaco-languageclient'
import { markRaw } from 'vue'
import '@codingame/monaco-vscode-theme-defaults-default-extension'
import './ts-highlight-0.0.1.vsix'

const install = async () => {
  console.log(1)
  await configureMonacoWorkers()
  console.log(2)
  await initVscodeServices({
    serviceConfig: {
      userServices: {
        ...getFileServiceOverrride(),
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride()
      },
      debugLogging: true
    }
  })
  console.log(3)

  await initWebSocketAndStartClient('ws://localhost:30001/typescript', ['typescript'])
  console.log(4)
  await initWebSocketAndStartClient('ws://localhost:30001/json', ['json'])
  console.log(5)
  await initWebSocketAndStartClient('ws://localhost:30001/sql', ['sql'])
  console.log(6)

  monaco.languages.register({
    id: 'typescript',
    extensions: ['.ts', '.tsx'],
    aliases: ['Typescript', 'ts']
    // mimetypes: ['application/json']
  })

  console.log(7)

  monaco.languages.register({
    id: 'sql',
    extensions: ['.sql']
    // mimetypes: ['application/json']
  })
}

setTimeout(() => {
  install()
}, 10000)

export class TextEditorHandler {
  editor?: monaco.editor.IStandaloneCodeEditor

  private manacoResolve: (manaco: monaco.editor.IStandaloneCodeEditor) => void = () => { }

  monaco: Promise<monaco.editor.IStandaloneCodeEditor>
  constructor(
    public content: string,
    public lang: string,
    public url?: string
  ) {
    this.lang = lang
    this.content = content

    this.monaco = new Promise(res => [
      this.manacoResolve = res
    ])
  }

  protected createModel(): {
    value: string
    language?: string
    uri?: monaco.Uri
  } {
    const language = this.lang
    const content = this.content
    const uri = this.url ? monaco.Uri.parse(this.url) : undefined

    return { language, value: content, uri }
  }


  initEditor(element: HTMLElement) {
    const { value, language, uri } = this.createModel()
    this.editor = markRaw(
      monaco.editor.create(element, {
        model: monaco.editor.createModel(value, language, uri),
        automaticLayout: true,
        wordBasedSuggestions: 'off'
      })
    )
    this.manacoResolve(this.editor)
  }

  setContent(content: string) {
    this.content = content
    this.editor?.setValue(this.content)
  }

  getContent(){
    return  this.editor?.getValue() || ''
  }

  destory() {
    this.editor?.getModel()?.dispose()
    this.editor?.dispose()
  }
}

function configureMonacoWorkers() {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
          type: 'module'
        })
    }
  })
}

const initWebSocketAndStartClient = (
  url: string,
  languageIds: string[],
  cb?: (client: MonacoLanguageClient) => void
) => {
  console.log('initWebSocketAndStartClient')
  const webSocket = new WebSocket(url)
  webSocket.onopen = () => {
    const socket = toSocket(webSocket)
    const reader = new WebSocketMessageReader(socket)
    const writer = new WebSocketMessageWriter(socket)
    const languageClient = createLanguageClient(
      {
        reader,
        writer
      },
      languageIds
    )
    languageClient
    languageClient.start()

    if (cb) {
      cb(languageClient)
    }
    reader.onClose(() => languageClient.stop())
  }
  return webSocket
}

function createLanguageClient(
  transports: MessageTransports,
  languageIds: string[]
): MonacoLanguageClient {
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
        return Promise.resolve(transports)
      }
    }
  })
}
