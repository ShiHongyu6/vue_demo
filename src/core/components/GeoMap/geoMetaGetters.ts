const module = await import('@/assets/Geo/GeoMeta.json')
const metaData = module.default;


export function getAdcodeByName(name: string) {
    //@ts-ignore
    const item = metaData[name];
    if(!item) {
        return null;
    }

    return item.adcode as string;
}

export function getChildrenByName(parentName: string): Array<{ name:string, adcode:string }> | null {
    //@ts-ignore
    const item = metaData[parentName];
    if(!item) {
        return null;
    }
    //@ts-ignore
    return item.children?.map((name) => ({
        name,
        //@ts-ignore
        adcode: metaData[name]?.adcode
    }));
}