import { defineStore } from "pinia";
import { fetchCovidData } from '@/fetch'

export type CovidState = {

};

export const useCovidStore = defineStore('covid', {
    state: () => {
        return {
            data: {} as any
        }
    },

    getters: {
        domesticData: (state) => {
            return state.data.areaTree.filter((item: any) => item.name === '中国')[0]
        },
    },

    actions: {
        async fetchCovidData() {
            const result = await fetchCovidData();
            //@ts-ignore
            this.data = result.data;
        }
    }
})