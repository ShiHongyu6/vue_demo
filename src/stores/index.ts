import { defineStore } from "pinia";
import { fetchCovidData } from '@/fetch'

export const useCovidStore = defineStore('covid', {
    state: () => {
        return {
            data: null as any | null,
            isLoading: false,
        }
    },

    getters: {
        domesticData: (state) => {
            if(!state.data) {
                return null
            }
            return state.data.areaTree.filter((item: any) => item.name === '中国')[0]
        },

        chinaDayList: (state) => {
            if(!state.data) {
                return null
            }

            return state.data.chinaDayList
        }
    },

    actions: {
        async fetchCovidData() {
            this.isLoading = true
            const result = await fetchCovidData()
            //@ts-ignore
            this.data = result
            this.isLoading = false
        }
    }
})