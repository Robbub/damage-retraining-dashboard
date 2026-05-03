import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

type ChartDataItem = {
    name: string
    value: number
}

type Props = {
    title: string
    data: ChartDataItem[]
    onClick?: (entry: any) => void
}

const COLOR_MAP: Record<string, string> = {
    line: "#3b82f6",
    curve: "#22c55e",
    web: "#f97316",
    vertical: "#3b82f6",
    horizontal: "#22c55e",
    diagonal: "#f97316",
    minor: "#22c55e",
    moderate: "#f97316",
    severe: "#ef4444",
}

export default function ClassDistributionChart({ title, data, onClick }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">
                {title}
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                        onClick={(entry) => onClick?.(entry)}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={COLOR_MAP[entry.name] ?? "#a855f7"}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                        <span 
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: COLOR_MAP[item.name] ?? "#a855f7"}}
                        />
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}