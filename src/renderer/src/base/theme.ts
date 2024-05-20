export class NColor {
    static gray = new NColor(140, 140, 140)
    static blue = new NColor(36, 110, 185)
    static green = new NColor(76, 185, 68)
    static white = new NColor(253, 255, 252)
    static yellow = new NColor(245, 238, 158)
    static salmon = new NColor(240, 101, 67)

    _rgba: [number, number, number, number] = [0, 0, 0, 0]

    constructor(r: number, g: number = r, b: number = g, a: number = 1) {
        this._rgba = [r, g, b, a]
    }

    rgba() {
        return `rgba(${this._rgba.join(',')})`
    }

    // 当前颜色作为背景时候，文字底色
    text() {
        return "#fff"
    }

    // 当前颜色作为背景时候，渲染阴影
    shadow() {
        return `0 4px 8px 0 rgba(${this._rgba[0]},${this._rgba[1]},${this._rgba[2]},0.3)`
    }

}

type ThemeColorVars<T extends string> = {
    [Property in T]: NColor;
}

class ThemeColor<Base extends string, Ext extends string = ''>{
    baseVars: Map<string, ThemeColorVars<Base>> = new Map()
    extVars: { [key in Ext]: Base } = {} as any
    static create<Base extends string>(name: string, color: ThemeColorVars<Base>) {
        const theme = new ThemeColor<Base>()
        return theme.load(name, color)
    }
    load(name: string, color: ThemeColorVars<Base>) {
        this.baseVars.set(name, color)
        return this
    }

    ext<ExtNext extends string>(val: { [key in ExtNext]: Base }) {
        const theme = new ThemeColor<Base, Ext | ExtNext>();
        theme.baseVars = this.baseVars
        theme.extVars = { ...this.extVars, ...val }
        return theme
    }
}


export const theme = ThemeColor.create('light', {

    // 基础色
    primary: NColor.gray,
    primary_light: NColor.gray,
    primary_hover: NColor.gray,
    primary_active: NColor.gray,

    // 文本色
    text_base: NColor.gray,
    text_secondary: NColor.gray,

    text_desc: NColor.gray,
    text_error: NColor.gray,
    text_disable: NColor.gray,

    bg_base: NColor.gray,
    bg_hover: NColor.gray,
    bg_active: NColor.gray,

    bg_divider: NColor.gray,

    // 功能色
    info: NColor.gray,
    success: NColor.gray,
    error: NColor.gray,
    warning: NColor.gray,

    bg_info: NColor.gray,
    bg_success: NColor.gray,
    bg_error: NColor.gray,
    bg_warning: NColor.gray

}).ext({
    text_link: 'primary',
})