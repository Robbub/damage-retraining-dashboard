import { useEffect, useState } from "react"
import { db } from "../firebase"
import {
    doc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy
} from "firebase/firestore"

type Job = {
    id: string
    status: string
    progress: number
    stage?: string
    datasetSize: number
}

type Log = {
    id: string
    message: string
    level: "info" | "warning" | "error"
    timestamp: any
}

type Props = {
    jobId: string
}

export default function LiveJobTerminalView({ jobId }: Props) {
    const [job, setJob] = useState<Job | null>(null)
    const [logs, setLogs] = useState<Log[]>([])

    useEffect(() => {
        if (!jobId) return

        const unsub = onSnapshot(
            doc(db, "training_jobs", jobId),
            (snapshot) => {
                if (snapshot.exists()) {
                    setJob({
                        id: snapshot.id,
                        ...snapshot.data()
                    } as Job)
                }
            }
        )
        return () => unsub()
    }, [jobId])

    useEffect(() => {
        if (!jobId) return

        const q = query(
            collection(db, "training_logs"),
            where("jobId", "==", jobId),
            orderBy("timestamp", "asc")
        )

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Log[]
            setLogs(data)
        })
        return () => unsub()
    }, [jobId])

    if (!job) {
        return (
            <div className="bg-white p-4 rounded shadow">
                Loading job...
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-md border">
            <h2 className="text-lg font-bold mb-3">
                Live Training View
            </h2>

            <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                    {job.stage ?? "idle"}
                </span>
                <span className="font-semibold">
                    {job.status.toUpperCase()}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${job.progress ?? 0}%` }}
                />
            </div>

            <div className="bg-black text-green-400 text-xs p-3 rounded h-64 overflow-y-auto font-mono">
                {logs.map(log => (
                    <div key={log.id}>
                        [{log.level}] {log.message}
                    </div>
                ))}
            </div>
        </div>
    )
}