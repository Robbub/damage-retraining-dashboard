import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase"

type TrainingLog = {
    jobId: string
    message: string
    level: "info" | "warning" | "error"
    timestamp: Date
}

export const addTrainingLog = async (
    jobId: string,
    message: string,
    level: "info" | "warning" | "error" = "info"
) => {
    await addDoc(collection(db, "training_logs"), {
        jobId,
        message,
        level,
        timestamp: new Date()
    })
}