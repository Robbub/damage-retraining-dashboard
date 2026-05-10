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
    type?: string | null
    severity?: string | null
    orderByField?: "timestamp"
    orderDirection?: "asc" | "desc"
    pageSize?: number
    cursor?: QueryDocumentSnapshot<DocumentData> | null
}

export function buildCorrectionsQuery(options: CorrectionsQueryOptions): Query {
    const {
        usedInTraining = false,
        shape,
        type,
        severity,
        orderByField = "timestamp",
        orderDirection = "desc",
        pageSize = 20,
        cursor
    } = options

    let q = query(collection(db, "correctImagesByEngineer"))

    q = query(q, where("usedInTraining", "==", usedInTraining))

    if (shape) {
        q = query(q, where("correctedPrediction.shape", "==", shape))
    }

    if (type) {
        q = query(q, where("correctedPrediction.direction", "==", type))
    }

    if (severity) {
        q = query(q, where("correctedPrediction.severity", "==", severity))
    }

    q = query(q, orderBy(orderByField, orderDirection))

    if (cursor) {
        q = query(q, startAfter(cursor))
    }

    q = query(q, limit(pageSize))

    return q
}