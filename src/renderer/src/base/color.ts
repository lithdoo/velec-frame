export class NColor {

    private _rgba: [number, number, number, number] = [0, 0, 0, 0]

    constructor(r: number, g: number = r, b: number = g, a: number = 1) {
        this._rgba = [r, g, b, a]
    }

    rgba() {
        return `rgba(${this._rgba.join(',')})`
    }

    hex(){
        const [r,g,b] = this._rgba
        const num = (r * (256 ** 2) + g * 256 + b ).toString(16)
        const txt = new Array(6-num.length).fill('0').join('') + num
        return '#' + txt
    }

    // 当前颜色作为背景时候，文字底色
    text() {
        
        const [r,g,b] = this._rgba
        
        const [max,_,min] = [r,g,b].sort((a, b) => a - b)

        const l = (max + min)/2

        if(l > 140) return '#333'
        else return "#fff"
    }

    // 当前颜色作为背景时候，渲染阴影
    shadow() {
        return `0 4px 8px 0 rgba(${this._rgba[0]},${this._rgba[1]},${this._rgba[2]},0.3)`
    }

}

export class ColorPalette {
    static hex(hexList:number[]) {
        const colorList = hexList.map(v=>{
            const b = v % 256
            const g = Math.floor(v/256) % 256
            const r = Math.floor(v/(256*256)) % 256
            return new NColor(r,g,b)
        }) as NColor[]
        return new ColorPalette(colorList)
    }

    static Dust_Red = ColorPalette.hex([0xfff1f0,0xffccc7,0xffa39e,0xff7875,0xff4d4f,0xf5222d,0xcf1322,0xa8071a,0x820014,0x5c0011])
    static Sunset_Orange = ColorPalette.hex([0xfff7e6,0xffe7ba,0xffd591,0xffc069,0xffa940,0xfa8c16,0xd46b08,0xad4e00,0x873800,0x612500])
    static Polar_Green = ColorPalette.hex([0xf6ffed,0xd9f7be,0xb7eb8f,0x95de64,0x73d13d,0x52c41a,0x389e0d,0x237804,0x135200,0x092b00])
    static Daybreak_Blue = ColorPalette.hex([0xe6f4ff,0xbae0ff,0x91caff,0x69b1ff,0x4096ff,0x1677ff,0x0958d9,0x003eb3,0x002c8c,0x001d66])

    static Clay_Brown = ColorPalette.hex([0xfdf6e3,0xEEE8D5,0xDDD6C1,0xD3CBB7,0xC8BE96,0xBEB478,0xAC9D57,0x968046,0x7D6228,0x645435])

    list: NColor[]
    constructor(list: NColor[]) {
        this.list = list
    }
}


export const Dust_Red = ColorPalette.hex([0xfff1f0,0xffccc7,0xffa39e,0xff7875,0xff4d4f,0xf5222d,0xcf1322,0xa8071a,0x820014,0x5c0011])