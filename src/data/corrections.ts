export type Correction = {
  id: string
  imageUrl: string
  predictedClass: string
  correctedClass: string
  status: "pending" | "approved" | "archived"
}

export const corrections: Correction[] = [
  {
    id: "1",
    imageUrl: "https://via.placeholder.com/150",
    predictedClass: "minor_crack",
    correctedClass: "major_crack",
    status: "pending",
  },
  {
    id: "2",
    imageUrl: "https://via.placeholder.com/150",
    predictedClass: "no_crack",
    correctedClass: "minor_crack",
    status: "approved",
  },
]