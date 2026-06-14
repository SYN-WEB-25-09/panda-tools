import { useState } from "react";

type DeleteTriggerFn = (
    id: string,
    callback: () => void
) => void

export function useItemDelete(triggerDelete: DeleteTriggerFn, confirmMessage: string) {
    const [refetchNonce, setRefetchNonce] = useState(0);

    const handleDelete = (id: string): void => {
        if (confirm(confirmMessage)) {
            triggerDelete(id, () => {
                setRefetchNonce((prev) => prev + 1)
            })
        }
    };

    return { refetchNonce, handleDelete}
}