<template>
    <div class="db-chart-sider">
        <div class="db-chart-sider__header"></div>
        <div class="db-chart-sider__body">
            <template v-for="(entity, index ) in entities" :key="entity.id">
                <div class="db-chart-sider__divide-before" :data-highlight="entitySorter.insertPos() === index"></div>
                <div class="db-chart-sider__entity-item" :data-draging='entitySorter.current === entity.id'>

                    <div class="db-chart-sider__drag-move-before" @drop="(e) => entitySorter.drop(e)"
                        @dragover="(e) => entitySorter.over(e, 'before', entity.id)" v-show="entitySorter.current">
                    </div>
                    <div class="db-chart-sider__drag-move-after" @drop="(e) => entitySorter.drop(e)"
                        @dragover="(e) => entitySorter.over(e, 'after', entity.id)" v-show="entitySorter.current"></div>


                    <div class="db-chart-sider__entity-color" :style="{ backgroundColor: entity.render.color }"></div>
                    <div class="db-chart-sider__entity-item-header" @click="() => toggleEntity(entity.table.name)">
                        <div class="db-chart-sider__dragger" draggable="true"
                            @dragstart="e => entitySorter.start(e, entity.table.name)"
                            @dragend="e => entitySorter.end(e, entity.table.name)">
                            <VxIcon name="drag-vertical"></VxIcon>
                        </div>
                        <template
                            v-if="entityNameEditor.current && entityNameEditor.current.oldName === entity.table.name">
                            <BtnInput class="db-chart-sider__entity-name-editor" @click.native.stop
                                v-model="entityNameEditor.current.newName" :placeholder="'请输入新表名'">
                                <template #btns>
                                    <VxButton only-icon icon="clear" :click="() => entityNameEditor.cancel()">
                                    </VxButton>
                                    <VxButton only-icon icon="done" :click="() => entityNameEditor.submit()"></VxButton>
                                </template>
                            </BtnInput>
                        </template>
                        <template v-else>
                            <div class="db-chart-sider__entity-name" :title="entity.table.name">
                                {{ entity.table.name }}
                            </div>
                            <div class="db-chart-sider__entity-btns" @click.stop :title="entity.table.name">
                                <VxButton only-icon icon="edit" :click="() => entityNameEditor.start(entity)">
                                </VxButton>
                                <VxButton only-icon icon="focus" :click="() => focusEntiry(entity)"></VxButton>
                            </div>
                        </template>

                    </div>

                    <AutoDrawer :open="openEntityName === entity.table.name">
                        <div class="db-chart-sider__entity-item-body">
                            <div class="db-chart-sider__entity-fields">
                                <div class="db-chart-sider__field-title-with-creator">

                                    <div class="db-chart-sider__field-title">
                                        <div class="db-chart-sider__field-title-icon">
                                            <VxIcon name="fields"></VxIcon>
                                        </div>
                                        <div class="db-chart-sider__field-title-text">
                                            Fields
                                        </div>
                                        <div class="db-chart-sider__field-title-btns" @click.stop
                                            :data-show="fieldCreator.current && fieldCreator.current.entity === entity"
                                            :title="entity.table.name">

                                            <template
                                                v-if="fieldCreator.current && fieldCreator.current.entity === entity">
                                                <VxButton only-icon icon="clear" :click="() => fieldCreator.cancel()">
                                                </VxButton>
                                                <VxButton only-icon icon="done" :click="() => fieldCreator.submit()">
                                                </VxButton>
                                            </template>
                                            <template v-else>

                                                <VxButton only-icon icon="plus"
                                                    :click="() => fieldCreator.start(entity)">
                                                </VxButton>
                                            </template>
                                        </div>
                                    </div>
                                    <div class="db-chart-sider__field-creator"
                                        v-if="fieldCreator.current && fieldCreator.current.entity === entity">
                                        <div class="db-chart-sider__field-creator-name">
                                            <BtnInput class="db-chart-sider__field-name-editor" @click.native.stop
                                                v-model="fieldCreator.current.name" :placeholder="'请输入新字段名'">
                                            </BtnInput>
                                        </div>
                                        <div class="db-chart-sider__field-creator-type">
                                            <BtnSelector :options="fieldCreator.options"
                                                v-model="fieldCreator.current.type"></BtnSelector>
                                        </div>
                                    </div>
                                </div>
                                <div class="db-chart-sider__field-item" v-for="field in entity.table.fieldList"
                                    :key="field.name">
                                    <template
                                        v-if="fieldNameEditor.current && fieldNameEditor.current.oldName === field.name && fieldNameEditor.current.entity === entity">
                                        <BtnInput class="db-chart-sider__field-name-editor" @click.native.stop
                                            v-model="fieldNameEditor.current.newName" :placeholder="'请输入新字段名'">
                                            <template #btns>
                                                <VxButton only-icon icon="clear"
                                                    :click="() => fieldNameEditor.cancel()">
                                                </VxButton>
                                                <VxButton only-icon icon="done" :click="() => fieldNameEditor.submit()">
                                                </VxButton>
                                            </template>
                                        </BtnInput>
                                    </template>
                                    <template v-else>
                                        <div class="db-chart-sider__field-item-name" :title="field.name">{{ field.name
                                            }}
                                        </div>
                                        <div class="db-chart-sider__field-item-type">[{{ field.type }}]</div>

                                        <div class="db-chart-sider__field-item-btns" @click.stop
                                            :title="entity.table.name">
                                            <VxButton only-icon icon="focus" :click="() => focusEntiry(entity)">
                                            </VxButton>
                                            <VxButton only-icon icon="edit"
                                                :click="() => fieldNameEditor.start(entity, field.name)">
                                            </VxButton>
                                            <VxButton only-icon icon="del" v-if="entity.table.fieldList.length > 1"
                                                :click="() => removeField(entity, field.name)">
                                            </VxButton>
                                        </div>
                                    </template>
                                </div>

                            </div>
                        </div>
                    </AutoDrawer>
                </div>
                <div class="db-chart-sider__divide-after" :data-highlight="(entitySorter.insertPos() - 1) === index">
                </div>
            </template>


        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { EntityData } from '../ChartState';
import { VxIcon, AutoDrawer, VxButton, BtnInput, BtnSelector } from '@renderer/components';
import { fixReactive } from '@renderer/fix';
import { DBChartModel } from '../DBChartModel';
import { SqliteDataType } from '@common/sql';

const props = defineProps<{
    model: DBChartModel
}>()

const state = computed(() => props.model.state)

const entities = computed(() => {
    console.log('entities', state.value.nodes)
    const list = state.value.nodeIds.map(id => state.value.nodes.get(id)).filter(v => !!v) as EntityData[]
    const sort = list.sort((a, b) => a.render.list_idx - b.render.list_idx)
    return sort
})

const openEntityName = ref<string | null>(null)
const toggleEntity = (name: string) => {
    if (openEntityName.value === name) {
        openEntityName.value = null
    } else {
        openEntityName.value = name
    }
}

const entitySorter = fixReactive(new class {
    readonly key: string = Math.random().toString(36).substring(7);
    current: string | null = null;
    hoverRecevier: { pos: "after" | 'before', id: string } | null = null

    start(e: DragEvent, id: string) {
        e.dataTransfer?.setData(this.key, JSON.stringify(id));
        this.current = id;
    }

    over(ev: DragEvent, pos: 'after' | 'before', id: string) {
        ev.preventDefault();
        this.hoverRecevier = { pos, id }
    }

    end(_e: DragEvent, _id: string) {
        this.current = null;
        this.hoverRecevier = null
    }

    drop(ev: DragEvent) {
        ev.preventDefault();
        if (!this.current) return
        if (!this.hoverRecevier) return
        const list = entities.value.map(v => v.id)
        const current = this.current
        const { pos, id } = this.hoverRecevier
        const res = list.flatMap(name => {
            const transName = (name === current) ? '' : name
            if ((id === name) && (pos === 'before')) {
                return [current, transName]
            }
            if ((id === name) && (pos === 'after')) {
                return [transName, current]
            }
            return [transName]
        }).filter(v => !!v).map((table, idx) => ({ table, idx }))

        props.model.control.emit('db:sortTables', res)
    }

    insertPos() {
        if (!this.current) return -1
        if (!this.hoverRecevier) return -1
        const list = entities.value
        if (list.length <= 1) return -1
        const { pos, id } = this.hoverRecevier
        const insetPos = list.reduce((res, item, index) => {
            if (res >= 0) return res
            if (item.id !== id) return res
            if (pos === 'after') return index + 1
            if (pos === 'before') return index
            throw new Error('unknown pos')
        }, -1)
        return insetPos
    }
})

const focusEntiry = (entity: EntityData) => {
    props.model.control.emit('table:focus', entity.table.name)
}


const entityNameEditor = fixReactive(new class {
    current: { oldName: string, newName: string } | null = null

    start(entity: EntityData) {
        this.current = { oldName: entity.table.name, newName: entity.table.name }
    }

    cancel() {
        this.current = null
    }

    async submit() {
        if (this.current === null) return
        const { oldName, newName } = this.current
        if (oldName === newName) return this.cancel()
        await props.model.control.emit('table:rename', oldName, newName)
        return this.cancel()
    }
})


const fieldNameEditor = fixReactive(new class {
    current: {
        oldName: string,
        newName: string,
        entity: EntityData
    } | null = null

    start(entity: EntityData, field: string) {
        this.current = { oldName: field, newName: field, entity }
    }

    cancel() {
        this.current = null
    }

    async submit() {
        if (this.current === null) return
        const { oldName, newName, entity } = this.current
        if (oldName === newName) return this.cancel()
        await props.model.control.emit('field:rename', entity.table, oldName, newName)
        return this.cancel()
    }
})

const fieldCreator = fixReactive(new class {
    current: {
        name: string,
        type: {
            key: SqliteDataType,
            label: SqliteDataType
        }
        entity: EntityData
    } | null = null

    options = Array.from(Object.values(SqliteDataType)).map(val => ({ label: val, key: val }))

    start(entity: EntityData) {
        this.current = {
            name: '', type: {
                label: SqliteDataType.TEXT,
                key: SqliteDataType.TEXT
            }, entity
        }
    }

    cancel() {
        this.current = null
    }

    async submit() {
        if (this.current === null) return
        if (!this.current.name.trim()) return
        if (!this.current.type) return

        const { name, type, entity } = this.current
        await props.model.control.emit('field:add', entity.table, name, type.key)
        return this.cancel()
    }
})

const removeField = async(entity:EntityData, field: string) => {
    await props.model.control.emit('field:delete', entity.table, field)
}



</script>

<style lang="scss" scoped>
.db-chart-sider {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.db-chart-sider__header {
    flex: 0 0 auto
}

.db-chart-sider__body {
    flex: 1 1 0;
    height: 0;
    margin: 0 6px;
    overflow: auto;
}

.db-chart-sider__divide-before {
    height: 8px;
    position: relative;

    &:first-child {
        height: 16px;

        &::after {
            opacity: 0;
            height: 2px;
            bottom: 6px;
        }
    }


    &::after {
        content: '';
        position: absolute;
        height: 1px;
        left: 8px;
        right: 8px;
        bottom: 8px;
        background-color: rgb(255, 255, 255);
        opacity: 0.1;
        margin-right: 8px;
    }
}

.db-chart-sider__divide-after {
    height: 8px;
    position: relative;

    &:last-child {
        height: 16px;

        &::after {
            // opacity: 0;
            height: 2px;
            top: 6px;
        }
    }

    &::after {
        content: '';
        position: absolute;
        height: 1px;
        left: 8px;
        right: 8px;
        top: 8px;
        background-color: rgb(255, 255, 255);
        opacity: 0.1;
        margin-right: 8px;
    }

}

[data-highlight="true"] {
    &::after {
        opacity: 1 !important;
    }
}

.db-chart-sider__dragger {
    position: relative;
    z-index: 10;
    font-size: 16px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
}

.db-chart-sider__drag-move-before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background-color: rgba(0, 0, 0, 0);
    z-index: 9;
}

.db-chart-sider__drag-move-after {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background-color: rgba(255, 255, 255, 0);
    z-index: 9;
}

.db-chart-sider__entity-item {
    position: relative;
    padding-left: 6px;

    &[data-draging='true'] {
        opacity: 0.5;
    }

    .db-chart-sider__entity-item-header {
        display: flex;
        align-items: center;
        cursor: pointer;
        height: 40px;
        font-size: 14px;
        font-weight: 800;

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .db-chart-sider__entity-color {
            width: 6px;
            height: 100%;
            border-radius: 1px;
            position: absolute;
            top: 0;
            left: 0;
        }

        .db-chart-sider__entity-name {
            padding: 0 16px;
            padding-left: 4px;
            flex: 1 1 0;
            width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .db-chart-sider__entity-name-editor {
            flex: 1 1 0;
        }

        .db-chart-sider__entity-btns {
            flex: 0 0 0;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
            padding: 0 4px;
        }

        &:hover .db-chart-sider__entity-btns {
            flex: 0 0 auto;
        }
    }

    .db-chart-sider__field-title-with-creator {
        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            text-decoration: underline;
        }
    }

    .db-chart-sider__field-title {
        height: 24px;
        font-size: 12px;
        padding: 0 4px;
        display: flex;
        flex-direction: row;
        align-items: center;

        .db-chart-sider__field-title-icon {
            margin-right: 4px;
            display: flex;
            align-items: center;
        }



        .db-chart-sider__field-title-text {
            flex: 1 1 0;
            width: 0;
            overflow: hidden;
        }

        .db-chart-sider__field-title-btns {
            flex: 0 0 0;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0;
            margin-left: 8px;

            &[data-show="true"] {
                flex: 0 0 auto;
            }
        }

        &:hover .db-chart-sider__field-title-btns {
            flex: 0 0 auto;
        }
    }

    .db-chart-sider__field-creator {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 0 8px;
        padding-bottom: 4px;

        .db-chart-sider__field-creator-type {
            flex: 0 0 80px;

            >* {
                width: 100%;
            }
        }


        .db-chart-sider__field-creator-name {
            flex: 1 1 0;
            width: 0;

            >* {
                width: 100%;
            }
        }
    }

    .db-chart-sider__field-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 32px;
        font-size: 14px;
        padding: 0 4px;
        padding-left: 20px;
        margin: 0 4px;
        cursor: pointer;


        .db-chart-sider__field-name-editor {
            flex: 1 1 0;
            margin-left: -12px;

            >* {
                height: 30px;
            }
        }

        .db-chart-sider__field-item-name {
            flex: 1 1 0;
            width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .db-chart-sider__field-item-type {
            flex: 0 0 auto;
        }

        .db-chart-sider__field-item-btns {
            flex: 0 0 0;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0;
            margin-left: 8px;
        }

        &:hover .db-chart-sider__field-item-btns {
            flex: 0 0 auto;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            text-decoration: underline;
        }
    }

}
</style>