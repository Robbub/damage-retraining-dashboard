type Props = {
    score?: number
}

export default function BatchDisagreementBadge({ score = 0 }: Props) {
    const getLabel = () => {
        if (score === 0) return "Perfect Dataset"
        if (score <= 33) return "Low Noise"
        if (score <= 66) return "Medium Noise"
        return "High Noise"
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