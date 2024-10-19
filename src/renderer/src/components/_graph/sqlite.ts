// import {  Shape } from '@antv/x6'
// import { GhEdge, GhNode } from './common'


// export enum SqliteValueType {
//     text = "TEXT",
//     integer = "INTEGER"
// }

// export type SqliteNodeState = {

//     id: string
//     name: string,
//     theme: {
//         color: string
//     },
//     data: {
//         fields: {
//             name: string;
//             type: SqliteValueType;
//             pk: number;
//             notnull: number;
//         }[],
//         foreignKeys: {
//             from: string;
//             to: string;
//             table: string;
//         }[],
//     }
// }

// export class GhSqliteTableNode extends GhNode {
//     static nodeType = 'GhSqliteTableNode'
//     static {
//         Shape.HTML.register({
//             shape:GhSqliteTableNode.nodeType,
//             html(cell) {
//                 const cntr = document.createElement('div')
//                 return cntr
//             }
//         })
//     }


//     nodeType = GhSqliteTableNode.nodeType

// }

// export class GhSqliteFkEdge extends GhEdge {
//     edgeType = 'GhSqliteFkEdge'
// }



