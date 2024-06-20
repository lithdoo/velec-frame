import { Ref, reactive, ref } from 'vue'

// https://github.com/vuejs/core/issues/2981
export const fixRef = <T>(val: T) => ref(val) as Ref<T>
export const fixReactive = <T extends object>(val: T) => reactive(val) as T