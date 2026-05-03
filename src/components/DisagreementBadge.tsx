import { getDisagreementScore } from "../utils/disagreementScore"
import { type Correction } from "../pages/common/interface"

type Props = {
    item: Correction
}

export default function DisagreementBadge({ item }: Props) {
    const score = getDisagreementScore(item)

    const getLabel = () => {
        if (score === 0) return "Perfect Match"
        if (score <= 33) return "Low Disagreement"
        if (score <= 66) return "Medium Disagreement"
        return "High Disagreement"
    } 
        
    const getColor = () => {
        if (score === 0) return "bg-green-100 text-green-700"
        if (score <= 33) return "bg-yellow-100 text-yellow-700"
        if (score <= 66) return "bg-orange-100 text-orange-700"
        return "bg-red-100 text-red-700"
    }
        

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColor()}`}>
            {getLabel()} ({score}%)
        </span>
    )
}