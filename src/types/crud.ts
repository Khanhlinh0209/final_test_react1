export type CrudId = string | number;

export type CrudQueryOptions = {
    signal?: AbortSignal;
};

export interface CrudService<
    TItem,
    TCreatePayload,
    TUpdatePayload = TCreatePayload,
    TId extends CrudId = string,
> {
    getAll: (options?: CrudQueryOptions) => Promise<TItem[]>;
    create: (payload: TCreatePayload) => Promise<TItem>;
    update: (id: TId, payload: TUpdatePayload) => Promise<TItem>;
    remove: (id: TId) => Promise<void>;
}

export type CrudMessages = {
    fetch: string;
    create: string;
    update: string;
    delete: string;
};
