import { EvalRef } from "../mutv-eval"
// import { MVFileMod, MVFileState } from "./base"
// import { MVModComponent } from "./Component"
// import { MVModValueStore } from "./store"


export type JtjTestCaseData = {
    last_mod_ts: number

    data: {
        name: string,
        value: EvalRef
    }[]

    task: {
        rootId: string,
        data: string
    }[]
}




// export class MVModTestCase extends MVFileMod<JtjTestCaseData> {
//     static namespace: 'TEST_CASE' = 'TEST_CASE'
//     readonly namespace = MVModTestCase.namespace
//     static blank(): JtjTestCaseData {
//         return {
//             last_mod_ts: new Date().getTime(),
//             data: [], task: []
//         }
//     }

//     data: JtjTestCaseData = MVModTestCase.blank()

//     constructor(
//         file: MVFileState,
//         private store: MVModValueStore,
//         private component: MVModComponent
//     ) {
//         super(file)
//         this.reload()
//     }

//     reload() {
//         this.data = this.getData() ?? MVModTestCase.blank()
//     }

//     getTestJsonData(caseId: string) {
//         return this.data.test_case_list.find(v => v.caseId === caseId)?.jsonData ?? ''
//     }

//     getTestJsonType(caseId: string) {
//         return this.data.test_case_list.find(v => v.caseId === caseId)?.type ?? 'text'
//     }

//     addTestCase(testCase: JtjTestCaseData['test_case_list']['0']) {
//         const { rootId, caseId } = testCase
//         const all = this.component.allComponents()
//         if (!all.find(v => v.rootId === rootId)) {
//             throw new Error(`component rootId "${rootId}" is not found!`)
//         }
//         if (this.data.test_case_list.find(v => v.caseId === caseId)) {
//             throw new Error(`caseid "${caseId}" is exist!`)
//         }

//         this.data.test_case_list = this.data.test_case_list.concat([testCase])
//         this.update()
//     }

//     delTestCase(caseId: string) {
//         if (!this.data.test_case_list.find(v => v.caseId === caseId)) {
//             throw new Error(`caseid "${caseId}" is not found!`)
//         }
//         this.data.test_case_list = this.data.test_case_list.filter(v => v.caseId !== caseId)
//         this.update()
//     }

//     updateCaseData(caseId: string, jsonData: string) {
//         const item = this.data.test_case_list.find(v => v.caseId === caseId)
//         if (!item) {
//             throw new Error(`caseid "${caseId}" is not found!`)
//         }

//         if (item.type !== 'script') {
//             try {
//                 JSON.parse(jsonData)
//             } catch (e: any) {
//                 throw new Error(`json is not valid: ${e.message}`)
//             }
//         }

//         this.data.test_case_list = this.data.test_case_list.map(v => v.caseId == caseId
//             ? { ...v, jsonData }
//             : v
//         )

//         this.update()
//     }

//     getAllTestList() {
//         return [...this.data.test_case_list]
//     }

//     private update() {
//         this.data.last_mod_ts = new Date().getTime()
//         this.setData({
//             last_mod_ts: this.data.last_mod_ts,
//             test_case_list: this.data.test_case_list.map(v => ({ ...v }))
//         })
//     }

// }



// export class MVRenderModTestCase extends MVRenderMod<JtjTestCaseData> {
//     readonly namespace: 'TEST_CASE' = MVModTestCase.namespace

//     getTestList(rootId: string) {
//         return (this.getData()?.test_case_list ?? []).filter(v => v.rootId === rootId)
//     }

//     getCaseJson(caseId: string) {
//         const caseItem = (this.getData()?.test_case_list ?? []).find(v => v.caseId === caseId)
//         if (!caseItem) return "{}"
//         if (caseItem.type === 'script') {
//             const fn = new Function(caseItem.jsonData)
//             return JSON.stringify(fn())
//         } else {
//             return caseItem.jsonData
//         }
//     }
// }