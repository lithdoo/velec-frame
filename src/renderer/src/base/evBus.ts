export class EventBus<Event> {
    listener: Map<any, EventListener<Event, unknown>> = new Map()

    remove(_key: any) {

    }

    add(_listener: EventListener<Event, unknown>) {

    }
}



export class EventListener<Event, Next = void> {
    key: any = null
    callback: (event: Event) => Promise<Next>
    private target: EventBus<Event> | null = null
    constructor(key: any, callback: (event: Event) => Promise<Next>) {
        this.key = key
        this.callback = callback
    }

    unbind() {
        if (this.target) this.target.remove(this.key)
    }


    bind(target: EventBus<Event>) {
        target.add(this)
        this.target = target
    }

}