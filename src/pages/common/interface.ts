export interface Correction {
  id: string
  imageUrl: string
  status: "pending" | "approved" | "archived"
  predicted: {
    shape?: "line" | "curve" | "web"
    direction?: "vertical" | "horizontal" | "diagonal"
    severity?: "minor" | "moderate" | "severe"
  }
  corrected: {
    shape?: "line" | "curve" | "web"
    direction?: "vertical" | "horizontal" | "diagonal"
    severity?: "minor" | "moderate" | "severe"
  }
  usedInTraining: boolean
}