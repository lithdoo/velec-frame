import { nanoid } from 'nanoid'

export enum GridStatus {
  error = 'error',
  loaded = 'loaded',
  loading = 'loading'
}

export type GridField<T> = DataField | ActionField<T>

export interface DataField {
  name: string
  fieldKey: string
  sortable: boolean
  align?: string
  width?: string | number
  minWidth?: string | number
  ellipsis?: boolean
}

export const field = (option: Partial<DataField> = {}): DataField => {
  return {
    name: 'id',
    fieldKey: 'id',
    sortable: false,
    ...option
  }
}

interface ActionBtn<_T> {
  title: string
  key: string
  disabled?: boolean
  confirm?: string
  action: (e: MouseEvent) => void | Promise<void>
}

export interface ActionField<T> {
  _type: 'action'
  key: string
  btns: (record: T, idx: number) => ActionBtn<T>[]
  width: () => number
}

export class ActionFieldBuilder<T> {
  key = nanoid()
  btns: (record: T, idx: number) => ActionBtn<T>[] = () => []
  width: () => number = () => 120

  actions(fn: (record: T, idx: number) => ActionBtn<T>[]) {
    this.btns = fn
    return this
  }

  build(): ActionField<T> {
    return {
      _type: 'action',
      key: this.key,
      btns: this.btns,
      width: this.width
    }
  }
}

export function isActionField<T>(field: GridField<T>): field is ActionField<T> {
  return (field as any)._type === 'action'
}

export function isDataField<T>(field: GridField<T>): field is DataField {
  return (field as any)._type !== 'action'
}

export type GridRenderData<ListData> = {
  current: number
  pageSize: number | null
  total: number
  sort?: { field: string; order: 'desc' | 'asc' } | null
  filters?: { field: string; value: string }[]
  list: ListData[]
  status: GridStatus
  pages: number
}

export type GridFetchPager = { current: number; pageSize: number }
export type GridFetchOption = {
  sort?: { field: string; order: 'desc' | 'asc' } | null
  filters?: { field: string; value: string }[]
}

export abstract class GridRequset<ListData> {
  abstract fetchData(
    page: GridFetchPager,
    option: GridFetchOption
  ): Promise<GridRenderData<ListData>>
  rowKey: (item: ListData) => string = (i: any) => (i.id ? i.toString() : '')

  queryParams(
    page: { current: number; pageSize: number }
    // option: {
    //     sort?: { field: string, order: 'desc' | 'asc' },
    //     filter?: never,
    // } = {},
  ) {
    return {
      pageNo: page.current,
      pageSize: page.pageSize,
      total: 0
    }
  }
  successData(
    respondData: any,
    trans?: (item: any) => ListData,
    extra?: Partial<GridRenderData<ListData>>
  ): GridRenderData<ListData> {
    const { records, total, size, current, pages } = respondData
    const list: ListData[] = trans ? records.map((item: any) => trans(item)) : records

    return {
      list,
      total: total as number,
      pageSize: size as number | null,
      current: current as number,
      status: GridStatus.loaded,
      pages,
      ...extra
    }
  }
  errorData(): GridRenderData<ListData> {
    return {
      list: [],
      total: 0,
      pageSize: 30,
      current: 1,
      pages: 1,
      status: GridStatus.error
    }
  }
}

export class DataGridHandler<T = any, Request extends GridRequset<T> = GridRequset<any>> {
  fields: GridField<T>[] = []
  antTableBind: any = {}

  grid: GridRenderData<T> = {
    current: 1,
    pageSize: 30,
    pages: 1,
    total: 0,
    list: [],
    status: GridStatus.loading
  }

  option: {
    sort?: { field: string; order: 'desc' | 'asc' }
  } = {}

  request: Request

  seq = true

  afterUpdateData: () => void = () => {}

  constructor(request: Request, fetchDataOnInit = true) {
    this.request = request
    if (fetchDataOnInit) {
      this.refresh()
    }
  }

  async fetch(
    page: { current: number; pageSize: number },
    option: {
      sort?: { field: string; order: 'desc' | 'asc' }
      filter?: never
    } = {},
    showLoading = true
  ) {
    // 加载完成时是否改变loading状态
    if (showLoading) {
      this.grid.status = GridStatus.loading
    }
    const fetchedData = await this.request.fetchData(page, option)
    this.grid = fetchedData

    if (option) {
      this.option = option
    }

    // 当前页 大于总页数时，再次请求展示前一页的数据
    if (this.grid.pages && this.grid.pages < page.current) {
      this.grid = await this.request.fetchData(
        {
          pageSize: page.pageSize,
          current: this.grid.pages
        },
        option
      )
    }

    if (this.afterUpdateData) {
      this.afterUpdateData()
    }
  }

  async refresh(showLoading = true) {
    const page = {
      current: this.grid.current,
      pageSize: this.grid.pageSize || 30
    }
    const option = {
      sort: this.option.sort || undefined
      // filters: this.option.filters || undefined
    }
    await this.fetch(page, option, showLoading)
  }
}
