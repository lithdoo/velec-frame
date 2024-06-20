import { reactive } from "vue";

class ContextMenu {
    ev: MouseEvent | null = null
   
    open(list: any) {
        this.$emitOpen?.(list)
    }
    $emitOpen?: (list: any) =>void

    close(){
        
    }
}

export const contextMenu = reactive(new ContextMenu()) as ContextMenu

; (window as any).context = contextMenu