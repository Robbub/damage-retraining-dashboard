import type { TrainingJobStatus } from "./trainingJobStatus"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

export type DatasetSnapshot = {
    usedInTraining: boolean
    shape?: string | null
    direction?: string | null
    severity?: string | null
    orderByField: "createdAt"
    orderDirection: "asc" | "desc"
}

export const updateJobStatus = async (
    jobId: string,
    status: TrainingJobStatus,
    extra?: Record<string, any>
) => {
    await updateDoc(doc(db, "training_jobs", jobId), {
        ...extra,
        status,
        updatedAt: new Date()
    })
}