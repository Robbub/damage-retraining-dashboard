import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"

type TrainingJob = {
    datasetSize: number
}

type ModelVersion = {
    currentVersion: string
}

type Analytics = {
    totalRuns: number
    latestVersion: string
    avgBatchSize: number
    pendingCorrections: number
}

export default function TrainingAnalyticsCards() {
    const [analytics, setAnalytics] = useState<Analytics>({
        totalRuns: 0,
        latestVersion: "-",
        avgBatchSize: 0,
        pendingCorrections: 0,
    })

    useEffect(() => {
        const unsubJobs = onSnapshot(collection(db, "training_jobs"), (snapshot) => {
            const jobs = snapshot.docs.map(doc => doc.data() as TrainingJob)
            const totalRuns = jobs.length
            const totalBatch = jobs.reduce(
                (sum, job) => sum + (job.datasetSize || 0),
                0
            )
            const avgBatchSize =
                totalRuns > 0 ? Math.round(totalBatch / totalRuns) : 0
            
            setAnalytics(prev => ({
                ...prev,
                totalRuns,
                avgBatchSize,
            }))
        })
        const unsubModel = onSnapshot(collection(db, "model_versions"), (snapshot) => {
            if (!snapshot.empty) {
                const model = snapshot.docs[0].data() as ModelVersion

                setAnalytics(prev => ({
                    ...prev,
                    latestVersion: model.currentVersion,
                }))
            }
        })
        const unsubCorrections = onSnapshot(collection(db, "corrections"), (snapshot) => {
            const pending = snapshot.docs.filter(
                doc => !doc.data().usedInTraining
            ).length

            setAnalytics(prev => ({
                ...prev,
                pendingCorrections: pending,
            }))
        })
        return () => {
            unsubJobs()
            unsubModel()
            unsubCorrections()
        }
    }, [])
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card title="Total Retraining Runs" value={analytics.totalRuns} />
            <Card title="Latest Model Version" value={analytics.latestVersion} />
            <Card title="Average Batch Size" value={analytics.avgBatchSize} />
            <Card title="Pending Corrections" value={analytics.pendingCorrections} />
        </div>
    )
}

function Card({ title, value }: { title: string; value: string | number}) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text2xl font-bold mt-2">{value}</p>
        </div>
    )
}