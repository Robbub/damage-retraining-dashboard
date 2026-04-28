import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

type ChartData = {
    name: string
    value: number
}

export default function ClassDistributionChart() {
    const [data, setData] = useState<ChartData[]>([])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "corrections"), (snapshot) => {
            const counts: Record<string, number> = {}

            snapshot.forEach((doc) => {
                const item = doc.data()
                const label = item.correctedClass || "Unknown"
                
                counts[label] = (counts[label] || 0) + 1
            })

            const formatted = Object.entries(counts).map(([key, value]) => ({
                name: key,
                value,
            }))
            setData(formatted)
        })
        return () => unsub()
    }, [])

    const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#a855f7"]

    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">
                Class Distribution (Corrected Labels)
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}