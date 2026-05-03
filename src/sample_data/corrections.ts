export type Correction = {
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

export const corrections: Correction[] = [
  {
    id: "1",
    imageUrl: "https://via.placeholder.com/150",
    predicted: {
      shape: "line",
      direction: "horizontal",
      severity: "minor"
    },
    corrected: {
      shape: "line",
      direction: "horizontal",
      severity: "moderate"
    },
    status: "pending",
    usedInTraining: false
  },
  {
    id: "2",
    imageUrl: "https://via.placeholder.com/150",
    predicted: {
      shape: "curve",
      direction: "diagonal",
      severity: "minor"
    },
    corrected: {
      shape: "curve",
      direction: "horizontal",
      severity: "minor"
    },
    status: "approved",
    usedInTraining: false
  },
]