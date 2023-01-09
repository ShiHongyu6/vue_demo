import AbstractFetchCacheManager from "./AbstractFetchResorceManager"
import { fetchMapJSON } from '@/fetch'
export default class GeoMapJSONResource extends AbstractFetchCacheManager<string, object> {
    // override
    protected fetchResource(adcode: string): Promise<object> {
        return fetchMapJSON(adcode);
    }
}