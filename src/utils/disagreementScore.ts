import { type Correction } from "../pages/common/interface"

export function getDisagreementScore(item: Correction): number {
    if (!item.prediction || !item.correctedPrediction) return 0

    let mismatches = 0
    let total = 0

    const fields: (keyof Correction["prediction"])[] = [
        "shape",
        "type",
        "severity"
    ]

    for (const  field of fields) {
        total++

        if (item.prediction[field] !== item.correctedPrediction[field]) {
            mismatches++
        }
    }
    
    return Math.round((mismatches / total) * 100)
}