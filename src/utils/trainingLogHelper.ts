import { updateJobStatus } from "../types/training";
import { addTrainingLog } from "./trainingLogs";
import { type TrainingStage } from "../types/trainingStage";

const setStage = async (
    jobId: string,
    stage: TrainingStage,
    progress: number,
    message?: string,
    level: "info" | "warning" | "error" = "info"
) => {
    await updateJobStatus(jobId, "running", {
        stage,
        progress
    })

    if (message) {
        await addTrainingLog(jobId, message, level)
    }
}