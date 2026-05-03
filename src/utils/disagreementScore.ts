import { type Correction } from "../pages/common/interface"

export function getDisagreementScore(item: Correction): number {
    if (!item.predicted || !item.corrected) return 0

    let mismatches = 0
    let total = 0

    const fields: (keyof Correction["predicted"])[] = [
        "shape",
        "direction",
        "severity"
    ]

    for (const  field of fields) {
        total++

        if (item.predicted[field] !== item.corrected[field]) {
            mismatches++
        }
    }
    
    return Math.round((mismatches / total) * 100)
}