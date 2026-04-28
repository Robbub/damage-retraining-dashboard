export interface Correction {
    id: string
    imageUrl: string
    predictedClass: string
    correctedClass: string
    status: string
    usedInTraining: boolean
}