export interface Correction {
  id: string
  originalS3Url?: string
  storageUrl?: string
  statusMessage: "pending" | "approved" | "archived"
  prediction: {
    shape?: string
    type?: string
    severity?: string
  }
  correctedPrediction: {
    shape?: string
    type?: string
    severity?: string
  }
  usedInTraining: boolean
}