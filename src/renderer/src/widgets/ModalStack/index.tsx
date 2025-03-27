import { VNode } from 'vue'
import { ModalStackHandlerBase } from './ModalStack.vue'
import { TextEditorHandler } from '../TextEditor'
import ModalEditor from './ModalEditor.vue'
import { nanoid } from 'nanoid'

export {
    default as ModalStack,
    ModalStackHandlerBase
} from './ModalStack.vue'

export {
    default as ModalInfo,
} from './ModalInfo.vue'

export type {
    ModalInfoOption
} from './ModalInfo.vue'



export interface TextEditorOption {
    content: string,
    lang: string,
    title: string | VNode,
    icon?: string | VNode,
    // width?: string,
    // height?: string,
    submit?(content: string): void
    cancel?(): void
}

export class ModalStackHandler extends ModalStackHandlerBase {

    textEditor(option: TextEditorOption) {
        const { content, lang, title, icon } = option
        const text = new TextEditorHandler(content, lang)
        const key = nanoid()
        const submit = () => {
            const content =  text.getContent()
            alert(content)
            option.submit?.(content)
        }
        const close = () => { 
            option.cancel?.()
            this.remove(key)
        }
        const inner = <ModalEditor option={{
            key, title, icon, text, close, submit
        }}></ModalEditor>

        this.push({ key, content: inner })
    }
}