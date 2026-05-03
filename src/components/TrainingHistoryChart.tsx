import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { useNavigate } from "react-router-dom"

type TrainingJob = {
    datasetSize: number
}

type ChartData = {
    run: string
    batchSize: number
}

export default function TrainingHistoryChart() {
    const navigate = useNavigate()
    const [data, setData] = useState<ChartData[]>([])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "training_jobs"), (snapshot) => {
            const jobs = snapshot.docs.map(doc => doc.data() as TrainingJob)
            const formatted = jobs.map((job, index) => ({
                run: `Run ${index + 1}`, // later for chronological use run: job.createdAt.toDate().toLocaleDateString()
                batchSize: job.datasetSize || 0,
            }))
            setData(formatted)
        })
        return () => unsub()
    }, [])
    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">
                Retraining History
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                    data={data}
                    onClick={(data: any) => {
                        if (!data?.activePayload) return
                        const payload = data.activePayload[0].payload
                        navigate("/jobs", {
                            state: {
                                filter: {
                                    date: payload.date
                                }
                            }
                        })
                    }}
                >
                    <XAxis dataKey="run" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="batchSize" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}