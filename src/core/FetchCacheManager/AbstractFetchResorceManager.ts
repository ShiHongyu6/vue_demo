type CacheStoreItem<Cache> = {
    lru_index: number;
    cache: Cache
}

export default abstract class AbstractFetchCacheManager<K, V> {
    private cacheStore: Map<K, CacheStoreItem<V>>;
    private lru: Array<K>;
    private max: number;
    constructor(max: number) {
        this.cacheStore = new Map();
        this.lru = new Array();
        this.max = max;
    }

    /**
     * 通过网络请求获取
     * @param key 
     */
    protected abstract fetchResource(key: K): Promise<V>;

    public async getResource(key: K): Promise<V> {
        const c = this.cacheStore.get(key);
        if (c) {
            const { cache, lru_index } = c;
            // 将缓存置为 最新
            this.lru.splice(lru_index, 1);
            this.lru.push(key);
            c.lru_index = this.lru.length - 1;

            return cache;
        }

        const newResource = await this.fetchResource(key);
        this.lru.push(key);
        if (this.lru.length > this.max) {
            this.lru.shift();
        }
        this.cacheStore.set(key, { lru_index: this.lru.length - 1, cache: newResource });

        return newResource;
    }
}