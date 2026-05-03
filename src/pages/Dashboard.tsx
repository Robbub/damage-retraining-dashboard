import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { type Correction } from "./common/interface"
import ModelVersionCard from "../components/ModelVersionCard"
import TrainingAnalyticsCards from "../components/TrainingAnalyticsCards"
import TrainingHistoryChart from "../components/TrainingHistoryChart"
import ClassDistributionChart from "../components/ClassDistributionChart"
import { useNavigate } from "react-router-dom"
import { Clock3, CheckCircle2, Archive } from "lucide-react"
import TrainingJobLiveView from "../components/TrainingJobLiveView"

const THRESHOLD = 50

export default function Dashboard() {
    const navigate = useNavigate()
    const [corrections, setCorrections] = useState<Correction[]>([])
    const pendingTrainingCount = 
        corrections.filter(
            c => !c.usedInTraining
        ).length
    const isReadyForRetraining =
        pendingTrainingCount >= THRESHOLD

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "corrections"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Correction[]

            setCorrections(data)
        })

        return () => unsub()
    }, [])
    const pending = corrections.filter(c => c.status === "pending").length
    const approved = corrections.filter(c => c.status === "approved").length
    const archived = corrections.filter(c => c.status === "archived").length
    
    const shapeCounts = corrections.reduce((acc, curr) => {
        const key = curr.corrected?.shape ?? "unknown"
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const directionCounts = corrections.reduce((acc, curr) => {
        const key = curr.corrected?.direction ?? "unknown"
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const severityCounts = corrections.reduce((acc, curr) => {
        const key = curr.corrected?.severity ?? "unknown"
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const toChartData = (obj: Record<string, number>) =>
        Object.entries(obj).map(([key, value]) => ({
            name: key,
            value,
        }))

    const shapeData = toChartData(shapeCounts)
    const directionData = toChartData(directionCounts)
    const severityData = toChartData(severityCounts)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Crack Classification Dashboard
                </h1>
                <p className="text-slate-500 mb-6">
                    Monitor corrections, retraining readiness, and model versions
                </p>

                <ModelVersionCard />

                <div className="bg-white p-4 rounded shadow-md border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4">
                        Training Readiness
                    </h2>

                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div 
                            className={`h-4 transition-all duration-500 ${
                                isReadyForRetraining ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{
                                width: `${Math.min(
                                    (pendingTrainingCount / THRESHOLD) * 100,
                                    100
                                )}%`
                            }}
                        />
                    </div>

                    <div className="flex justify-between mt-2 text-sm text-slate-600">
                        <span>{pendingTrainingCount} samples</span>
                        <span>{THRESHOLD}</span>
                    </div>

                    {isReadyForRetraining && (
                        <div className="mt-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl p-3">
                            Retraining Threshold Reached - Ready to Train
                        </div>
                    )}

                    <div className="mt-3 py-4">
                        <button
                            onClick={() => navigate("/training")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
                        >
                            Go To Training Queue
                        </button>
                    </div>

                    <TrainingJobLiveView />
                </div>

                <TrainingAnalyticsCards />

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-amber-600">{pending}</p>
                        </div>
                        <Clock3 className="text-amber-500" size={28} />
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Approved</p>
                            <p className="text-xl font-bold text-emerald-600">{approved}</p>
                        </div>
                        <CheckCircle2 className="text-emerald-500" size={28} />
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Archived</p>
                            <p className="text-xl font-bold text-slate-600">{archived}</p>
                        </div>
                        <Archive className="text-slate-500" size={28} />
                    </div>
                </div>

                <TrainingHistoryChart />
                <div>
                    <ClassDistributionChart
                        title="Shape Distribution"
                        data={shapeData}
                        onClick={(entry) => {
                            const value = entry?.name
                            if (!value) return

                            navigate(`/training?shape=${value}`)
                        }}
                    />
                </div>

                <div>
                    <ClassDistributionChart 
                        title="Direction Distribution"
                        data={directionData}
                        onClick={(entry) => {
                            const value = entry?.name
                            if (!value) return

                            navigate(`/training?direction=${value}`)
                        }}
                    />
                </div>
                <div>
                    <ClassDistributionChart
                        title="Severity Distribution"
                        data={severityData}
                        onClick={(entry) => {
                            const value = entry?.name
                            if (!value) return

                            navigate(`/training?severity=${value}`)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}