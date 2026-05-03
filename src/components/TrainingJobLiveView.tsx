import { useState, useEffect } from "react"
import { onSnapshot, collection, orderBy, limit, query } from "firebase/firestore"
import { db } from "../firebase"

type Job = {
    id: string
    status: string
    progress: number
    stage?: string
    datasetSize: number
    createdAt: any
}

export default function TrainingJobLiveView() {
    const [jobs, setJobs] = useState<Job[]>([])

    useEffect(() => {
        const unsub = onSnapshot (
            query(
                collection(db, "training_jobs"),
                orderBy("createdAt", "desc"),
                limit(5)
            ),
            (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Job[]
            setJobs(data)
        })
        return () => unsub()
    }, [])

    return (
        <div className="bg-white rounded-2xl shadow-md border p-4 mb-6">
            <h2 className="text-lg font-bold mb-4">
                Live Training Jobs
            </h2>

            {jobs.map(job => (
                <div key={job.id} className="mb-4 p-3 border rounded-lg">
                    <div className="flex justify-between">
                        <p className="text-xs text-gray-400">
                            Job ID: {job.createdAt?.toDate()?.toLocaleDateString()}
                        </p>

                        <p className="font-semibold">
                            {job.status.toUpperCase()}
                        </p>

                        <p className="text-sm text-gray-500">
                            {job.datasetSize} samples
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                        Stage: {job.stage ?? "-"}
                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${job.progress ?? 0}%` }}
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                        {job.progress ?? 0}%
                    </p>
                </div>
            ))}
        </div>
    )
}