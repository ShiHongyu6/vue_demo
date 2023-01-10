import axiosInstance from "./axiosInstance";

export const fetchCovidData = async () => (await axiosInstance.get('/data')).data;
export const fetchMapJSON = async (adcode:string) => (await axiosInstance.get(`/map/${adcode}`)).data;