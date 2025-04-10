import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import { markRaw } from 'vue';

import * as monaco from 'monaco-editor'

window.MonacoEnvironment = {
	getWorker: function (_moduleId, label) {
		if (label === 'json') {
			return new jsonWorker();
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker();
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker();
		}
		if (label === 'typescript' || label === 'javascript') {
			return new tsWorker()
		}
		return new editorWorker();
	}
};





export abstract class MonacoEditor {

	abstract content: string
	abstract ext: string
	abstract element: HTMLElement
	abstract language: string
	abstract uri?: monaco.Uri

	protected editor?: monaco.editor.IStandaloneCodeEditor


	async init() {
		this.editor = markRaw(monaco.editor.create(this.element, {
			model: monaco.editor.createModel(this.content, this.language),
			automaticLayout: true,
			wordBasedSuggestions: 'off'
		}))

		this.editor.onDidChangeModelContent(() => {
			this.updateContent()
		})
	}

	private updateContentTimeout: any | null = null

	updateContent() {
		if (this.updateContentTimeout) {
			clearTimeout(this.updateContentTimeout)
		}
		this.updateContentTimeout = setTimeout(() => {
			this.content = this.editor?.getValue().toString() ?? ''
			console.log('finish update',this.editor?.getValue().toString())
		})
	}

	async dispose() {
		await this.editor?.dispose()
	}


	getContent(){
		return this.editor?.getValue().toString() ?? ''
	}

	setContent(text: string) {
		this.editor?.setValue(text)
	}
}
