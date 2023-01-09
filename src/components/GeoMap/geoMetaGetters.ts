const module = await import('@/assets/Geo/GeoMeta.json')
const metaData = module.default;


export function getAdcodeByName(name: string) {
    //@ts-ignore
    const item = metaData[name];
    if(!item) {
        return null;
    }

    return item.adcode;
}