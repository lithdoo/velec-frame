import { JthFileMod, JthFileState, JthRenderMod } from "../base"
import { JthModComponent } from "./Component"

export type JtjTestCaseData = {
    last_mod_ts: number
    test_case_list: {
        rootId: string,
        caseId: string,
        jsonData: string
    }[]
}




export class JthModTestCase extends JthFileMod<JtjTestCaseData> {
    static namespace: 'TEST_CASE' = 'TEST_CASE'
    readonly namespace: 'TEST_CASE' = JthModTestCase.namespace
    static blankData(): JtjTestCaseData {
        return {
            last_mod_ts: new Date().getTime(),
            test_case_list: []
        }
    }

    data: JtjTestCaseData = JthModTestCase.blankData()

    constructor(
        file: JthFileState,
        private component: JthModComponent
    ) {
        super(file)
        this.reload()
    }

    reload() {
        this.data = this.getData() ?? JthModTestCase.blankData()
    }

    getTestJsonData(caseId: string) {
        return this.data.test_case_list.find(v => v.caseId === caseId)?.jsonData ?? ''
    }

    addTestCase(testCase: JtjTestCaseData['test_case_list']['0']) {
        const { rootId, caseId } = testCase
        const all = this.component.allComponents()
        if (!all.find(v => v.rootId === rootId)) {
            throw new Error(`component rootId "${rootId}" is not found!`)
        }
        if (this.data.test_case_list.find(v => v.caseId === caseId)) {
            throw new Error(`caseid "${caseId}" is exist!`)
        }

        this.data.test_case_list = this.data.test_case_list.concat([testCase])
        this.update()
    }

    delTestCase(caseId: string) {
        if (!this.data.test_case_list.find(v => v.caseId === caseId)) {
            throw new Error(`caseid "${caseId}" is not found!`)
        }
        this.data.test_case_list = this.data.test_case_list.filter(v => v.caseId !== caseId)
        this.update()
    }

    updateCaseData(caseId: string, jsonData: string) {

        if (!this.data.test_case_list.find(v => v.caseId === caseId)) {
            throw new Error(`caseid "${caseId}" is not found!`)
        }

        try {
            JSON.parse(jsonData)
        } catch (e: any) {
            throw new Error(`json is not valid: ${e.message}`)
        }

        this.data.test_case_list = this.data.test_case_list.map(v => v.caseId == caseId
            ? { ...v, jsonData }
            : v
        )

        this.update()
    }

    getAllTestList() {
        return [...this.data.test_case_list]
    }

    private update() {
        this.data.last_mod_ts = new Date().getTime()
        this.setData({
            last_mod_ts: this.data.last_mod_ts,
            test_case_list: this.data.test_case_list.map(v => ({ ...v }))
        })
    }

}



export class JthRenderModTestCase extends JthRenderMod<JtjTestCaseData> {
    readonly namespace: 'TEST_CASE' = JthModTestCase.namespace

    getTestList(rootId: string) {
        return (this.getData()?.test_case_list ?? []).filter(v => v.rootId === rootId)
    }

    getCaseJson(caseId:string){
        return (this.getData()?.test_case_list?? []).filter(v=>v.caseId === caseId)[0]?.jsonData
    }
}