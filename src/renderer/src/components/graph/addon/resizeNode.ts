import { insertCss } from "insert-css"




insertCss(/*css*/`
    .resizeing * {
        cursor: nwse-resize!important;
    }
`)

export const initArch = (
    element: HTMLElement,
    getSize: () => { width: number, height: number, zoom: number },
    onSizeChange: (size: { width: number, height: number }) => void
) => {

    let event: null | MouseEvent = null
    let view: null | SVGElement = null
    let size: null | { width: number, height: number, zoom: number } = null


    const onMove = (before: MouseEvent, after: MouseEvent) => {
        if (!size) return
        const offset = {
            left: after.clientX - before.clientX,
            top: after.clientY - before.clientY
        }
        onSizeChange({
            width: size.width + offset.left * size.zoom,
            height: size.height + offset.top * size.zoom,
        })
    }

    const findView = (element: Element) => {
        if (element instanceof SVGElement && element.tagName === 'svg') return element
        else if (element.parentElement) return findView(element.parentElement)
        else return null
    }

    const done = () => {
        view?.removeEventListener('mouseup', done)
        view?.removeEventListener('mouseleave', done)
        view?.removeEventListener('mousemove', move)
        if (view) {
            view.classList.remove('resizeing')
        }
        event = null
        view = null
    }

    const move = (e: MouseEvent) => {
        e.stopPropagation()
        if (!event) return
        onMove(event, e)
    }

    element.onmousedown = (e) => {
        event = e
        view = findView(element)
        size = getSize()
        view?.addEventListener('mouseup', done)
        view?.addEventListener('mouseleave', done)
        view?.addEventListener('mousemove', move)
        if (view) {
            view.classList.add('resizeing')
        }
    }
}