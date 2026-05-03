import { updateJobStatus } from "../types/training"
import { getDocs, collection, updateDoc, doc, addDoc } from "firebase/firestore"
import { db } from "../firebase"
import { incrementVersion } from "./versioning"
import { addTrainingLog } from "./trainingLogs"

type RunTrainingParams = {
    jobId: string
    datasetSize: number
    trainingData: any[]
    disagreementScore: number
}

export const runTraining = async ({
    jobId,
    datasetSize,
    trainingData,
    disagreementScore
}: RunTrainingParams) => {
    try {
        await addTrainingLog(jobId, "Training job started")

        const setStage = async (
            jobId: string,
            stage: string,
            progress: number,
            message?: string
        ) => {
            await updateJobStatus(jobId, "running", {
                stage,
                progress
            })
            if (message) {
                await addTrainingLog(jobId, message)
            }
        }

        await setStage(jobId, "initializing", 5, "Initializing training job")
        await new Promise(res => setTimeout(res, 2000))

        await setStage(jobId, "loading_data", 20, "Loading dataset")
        await addTrainingLog(jobId, `Dataset Size: ${datasetSize}`)
        await new Promise(res => setTimeout(res, 2000))

        await setStage(jobId, "training", 60, "Training model")
        await new Promise(res => setTimeout(res, 2000))

        await setStage(jobId, "evaluating", 85, "Evaluating model")
        await new Promise(res => setTimeout(res, 2000))

        await setStage(jobId, "deploying", 95, "Deploying model")

        await addTrainingLog(jobId, "Creating new model version")

        const versionSnapshot = await getDocs(collection(db, "model_versions"))
        const activeDoc = versionSnapshot.docs.find(
            d => d.data().status === "active"
        )

        const currentVersion = activeDoc?.data().version ?? "v1.0.0"
        const nextVersion = incrementVersion(currentVersion)

        if (activeDoc) {
            await updateDoc(activeDoc.ref, {
                status: "archived",
                archivedAt: new Date()
            })
        }

        await addDoc(collection(db, "model_versions"), {
            version: nextVersion,
            trainingJobId: jobId,
            datasetSize,
            disagreementScore,
            createdAt: new Date(),
            status: "active"
        })

        await addTrainingLog(jobId, `New version created: ${nextVersion}`)

        for (const item of trainingData) {
            await updateDoc(doc(db, "corrections", item.id), {
                usedInTraining: true
            })
        }

        await addTrainingLog(jobId, "Marked dataset as used")

        await updateJobStatus(jobId, "completed", {
            progress: 100,
            stage: "completed",
            completedAt: new Date(),
            modelVersion: nextVersion
        })

        await addTrainingLog(jobId, "Training completed successfully")

        return {
            version: nextVersion,
        }
    } catch (err) {
        await addTrainingLog(jobId, `Error: ${String(err)}`, "error")
        await updateJobStatus(jobId, "failed", {
            error: String(err),
            failedAt: new Date()
        })
        throw err
    }
}