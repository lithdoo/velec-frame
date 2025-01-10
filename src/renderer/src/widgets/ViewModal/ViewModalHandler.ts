import { VNode } from "vue";

// export interface ConfirmModalButton {
//     type: 'link' | 'default' | 'danger' | 'primary'
//     text: string
//     icon?: string | VNode
//     action: (control: {
//         close: () => void,
//         handler: ConfirmModalHandler
//     }) => Promise<void> | void
// }

// export interface ConfirmModalContent {
//     title: string | VNode
//     message: string | VNode
//     icon?: string | VNode
//     buttons: ConfirmModalButton[] 
//     secordary?: ConfirmModalButton[] | VNode
// }

// export class ConfirmModalHandler {
//     static btnClose: () => ConfirmModalButton = () => ({
//         type: 'link',
//         text: '取消',
//         icon: 'mdi-close',
//         action: ({ close }) => { close() }
//     })
//     stacks: ConfirmModalContent[] = []
//     open(content: ConfirmModalContent) {
//         this.stacks = [content, ...this.stacks]
//     }
//     close(content:ConfirmModalContent){
//         this.stacks = this.stacks.filter(c => c !== content)
//     }
// }


export class ViewModalHandler {
    stacks: ModalContent[] = []
    push(content: ModalContent) {
        this.stacks = [content, ...this.stacks]
    }
    remove(key: string) {
        this.stacks = this.stacks.filter(c => c.key !== key)
    }
}

export interface ModalContent {
    key: string
    title: string | VNode
    icon?: string | VNode
    content: VNode | HTMLElement
}
