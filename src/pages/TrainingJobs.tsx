import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import BatchDisagreementBadge from "../components/BatchDisagreementBadge"
import TrainingJobLiveView from "../components/TrainingJobLiveView"

type TrainingJob = {
    id: string
    status: "queued" | "running" | "completed" | "failed"
    datasetSize: number
    disagreementScore?: number
    createdAt: any
    startedAt?: any
    completedAt?: any
    modelVersion?: string
}

export default function TrainingJobs() {
    const [jobs, setJobs] = useState<TrainingJob[]>([])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "training_jobs"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as TrainingJob[]
            data.sort((a, b) => {
                const aTime = a.createdAt?.seconds ?? 0
                const bTime = b.createdAt?.seconds ?? 0
                return bTime - aTime
            })
            setJobs(data)
        })
        return () => unsub()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
            <h1 className="text-2x1 font-bold mb-6">
                Training Jobs
            </h1>

            <TrainingJobLiveView />

            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-3">Status</th>
                            <th className="p-3">Dataset Size</th>
                            <th className="p-3">Created</th>
                            <th className="p-3">Started</th>
                            <th className="p-3">Completed</th>
                            <th className="p-3">Model Version</th>
                            <th className="p-3">Dataset Quality</th>
                        </tr>
                    </thead>

                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.id} className="border-b">
                                <td className="p-3">
                                    <span
                                        className={
                                            job.status === "completed"
                                            ? "text-green-600 font-semibold"
                                            : job.status === "running"
                                            ? "text-blue-600 font-semibold"
                                            : job.status === "failed"
                                            ? "text-red-600 font-semibold"
                                            : "text-gray-600"
                                        }
                                    >
                                        {job.status}
                                    </span>
                                </td>

                                <td className="p-3">
                                    {job.datasetSize}
                                </td>

                                <td className="p-3">
                                    {job.createdAt?.toDate?.().toLocaleString?.() ?? "-"}
                                </td>

                                <td className="p-3">
                                    {job.startedAt?.toDate?.().toLocaleString?.() ?? "-"}
                                </td>

                                <td className="p-3">
                                    {job.completedAt?.toDate?.().toLocaleString?.() ?? "-"}
                                </td>

                                <td className="p-3">
                                    {job.modelVersion ?? "-"}
                                </td>

                                <td className="p-3">
                                    <BatchDisagreementBadge score={job.disagreementScore} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}