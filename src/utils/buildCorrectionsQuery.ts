import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Query,
    type DocumentData,
    QueryDocumentSnapshot
} from "firebase/firestore"
import { db } from "../firebase"

export type CorrectionsQueryOptions = {
    usedInTraining?: boolean
    shape?: string | null
    direction?: string | null
    severity?: string | null
    orderByField?: "createdAt"
    orderDirection?: "asc" | "desc"
    pageSize?: number
    cursor?: QueryDocumentSnapshot<DocumentData> | null
}

export function buildCorrectionsQuery(options: CorrectionsQueryOptions): Query {
    const {
        usedInTraining = false,
        shape,
        direction,
        severity,
        orderByField = "createdAt",
        orderDirection = "desc",
        pageSize = 20,
        cursor
    } = options

    let q = query(collection(db, "corrections"))

    q = query(q, where("usedInTraining", "==", usedInTraining))

    if (shape) {
        q = query(q, where("corrected.shape", "==", shape))
    }

    if (direction) {
        q = query(q, where("corrected.direction", "==", direction))
    }

    if (severity) {
        q = query(q, where("corrected.severity", "==", severity))
    }

    q = query(q, orderBy(orderByField, orderDirection))

    if (cursor) {
        q = query(q, startAfter(cursor))
    }

    q = query(q, limit(pageSize))

    return q
}