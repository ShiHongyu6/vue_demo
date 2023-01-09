import { defineStore } from "pinia";
import { fetchData } from '@/fetch'

export type CovidState = {

};

export const useCovidStore = defineStore('covid', {
    state: () => {
        return {
            data: {} as any
        }
    },


    actions: {
        async getData() {
            const result = await fetchData();
            console.log(result.data.data);
            //@ts-ignore
            this.data = result.data.data;
        }
    }
})