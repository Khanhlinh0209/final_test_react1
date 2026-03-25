import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CrudId, CrudMessages, CrudService } from "../types/crud";

type UseCrudParams<
    TItem,
    TCreatePayload,
    TUpdatePayload = TCreatePayload,
    TId extends CrudId = string,
> = {
    service: CrudService<TItem, TCreatePayload, TUpdatePayload, TId>;
    enabled?: boolean;
    messages?: Partial<CrudMessages>;
    refetchInterval?: number;
    select?: (data: TItem[]) => TItem[];
    onError?: (error: unknown, action: "fetch" | "create" | "update" | "delete") => void;
    optimistic?: {
        create?: (current: TItem[], payload: TCreatePayload) => TItem[];
        update?: (current: TItem[], id: TId, payload: TUpdatePayload) => TItem[];
        delete?: (current: TItem[], id: TId) => TItem[];
    };
};

const defaultMessages: CrudMessages = {
    fetch: "Cannot fetch data.",
    create: "Cannot create item.",
    update: "Cannot update item.",
    delete: "Cannot delete item.",
};

type RefetchOptions = {
    silent?: boolean;
};

function isAbortError(error: unknown) {
    return (
        error instanceof DOMException && error.name === "AbortError"
    ) || (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: string }).code === "ERR_CANCELED"
        );
}

export function useCrud<
    TItem,
    TCreatePayload,
    TUpdatePayload = TCreatePayload,
    TId extends CrudId = string,
>({
    service,
    enabled = true,
    messages,
    refetchInterval,
    select,
    onError,
    optimistic,
}: UseCrudParams<TItem, TCreatePayload, TUpdatePayload, TId>) {
    const [items, setItems] = useState<TItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);
    const isMountedRef = useRef(false);
    const serviceRef = useRef(service);

    const mergedMessages: CrudMessages = useMemo(() => ({
        ...defaultMessages,
        ...messages,
    }), [messages]);

    useEffect(() => {
        serviceRef.current = service;
    }, [service]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
        };
    }, []);

    const resetState = useCallback(() => {
        setItems([]);
        setError(null);
        setLoading(false);
    }, []);

    const refetch = useCallback(async (options?: RefetchOptions) => {
        const shouldShowLoading = !options?.silent;
        const controller = new AbortController();
        const requestId = requestIdRef.current + 1;

        requestIdRef.current = requestId;
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if (shouldShowLoading) {
            setLoading(true);
        }

        setError(null);

        try {
            const data = await serviceRef.current.getAll({ signal: controller.signal });
            const transformedData = select ? select(data) : data;

            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return;
            }

            setItems(transformedData);
        } catch (fetchError) {
            if (isAbortError(fetchError)) {
                return;
            }

            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return;
            }

            onError?.(fetchError, "fetch");
            setError(mergedMessages.fetch);
        } finally {
            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return;
            }

            if (shouldShowLoading) {
                setLoading(false);
            }
        }
    }, [mergedMessages.fetch, onError, select]);

    useEffect(() => {
        if (!enabled) {
            abortControllerRef.current?.abort();
            resetState();
            return;
        }

        void refetch();
    }, [enabled, refetch, resetState]);

    useEffect(() => {
        if (!enabled || !refetchInterval || refetchInterval <= 0) {
            return;
        }

        const intervalId = window.setInterval(() => {
            void refetch({ silent: true });
        }, refetchInterval);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [enabled, refetch, refetchInterval]);

    const createItem = useCallback(
        async (payload: TCreatePayload) => {
            if (!enabled) {
                return undefined;
            }

            const previousItems = items;
            const optimisticItems = optimistic?.create ? optimistic.create(items, payload) : undefined;

            if (optimisticItems) {
                setItems(optimisticItems);
            }

            setMutating(true);
            setError(null);

            try {
                const created = await serviceRef.current.create(payload);
                await refetch({ silent: true });
                return created;
            } catch (mutationError) {
                if (optimisticItems) {
                    setItems(previousItems);
                }

                onError?.(mutationError, "create");
                setError(mergedMessages.create);
                return undefined;
            } finally {
                setMutating(false);
            }
        },
        [enabled, items, mergedMessages.create, onError, optimistic, refetch],
    );

    const updateItem = useCallback(
        async (id: TId, payload: TUpdatePayload) => {
            if (!enabled) {
                return undefined;
            }

            const previousItems = items;
            const optimisticItems = optimistic?.update ? optimistic.update(items, id, payload) : undefined;

            if (optimisticItems) {
                setItems(optimisticItems);
            }

            setMutating(true);
            setError(null);

            try {
                const updated = await serviceRef.current.update(id, payload);
                await refetch({ silent: true });
                return updated;
            } catch (mutationError) {
                if (optimisticItems) {
                    setItems(previousItems);
                }

                onError?.(mutationError, "update");
                setError(mergedMessages.update);
                return undefined;
            } finally {
                setMutating(false);
            }
        },
        [enabled, items, mergedMessages.update, onError, optimistic, refetch],
    );

    const deleteItem = useCallback(
        async (id: TId) => {
            if (!enabled) {
                return;
            }

            const previousItems = items;
            const optimisticItems = optimistic?.delete ? optimistic.delete(items, id) : undefined;

            if (optimisticItems) {
                setItems(optimisticItems);
            }

            setMutating(true);
            setError(null);

            try {
                await serviceRef.current.remove(id);
                await refetch({ silent: true });
            } catch (mutationError) {
                if (optimisticItems) {
                    setItems(previousItems);
                }

                onError?.(mutationError, "delete");
                setError(mergedMessages.delete);
            } finally {
                setMutating(false);
            }
        },
        [enabled, items, mergedMessages.delete, onError, optimistic, refetch],
    );

    return {
        items,
        loading,
        mutating,
        error,
        refetch,
        createItem,
        updateItem,
        deleteItem,
    };
}
