import { useEffect, useState, useMemo } from "react"
import { db } from "../firebase"
import {
    collection,
    onSnapshot,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    QueryDocumentSnapshot,
    type DocumentData
} from "firebase/firestore"
import { type Correction } from "./common/interface"
import { incrementVersion } from "../utils/versioning"
import { useLocation, useNavigate } from "react-router-dom"
import { getDisagreementScore } from "../utils/disagreementScore"
import DisagreementBadge from "../components/DisagreementBadge"
import { buildCorrectionsQuery } from "../utils/buildCorrectionsQuery"
import type { DatasetSnapshot } from "../types/training"
import { updateJobStatus } from "../types/training"
import { runTraining } from "../utils/trainingRunner"
import TrainingJobLiveView from "../components/TrainingJobLiveView"

export default function TrainingQueuePage() {
    const [batch, setBatch] = useState<Correction[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const filter = useMemo(() => ({
        shape: queryParams.get("shape"),
        direction: queryParams.get("direction"),
        severity: queryParams.get("severity")
    }), [location.search])
    const navigate = useNavigate()

    const PAGE_SIZE = 20
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const filteredData = useMemo(() => {
        return batch.filter((item) => {
            if (filter.shape && item.corrected?.shape !== filter.shape) return false
            if (filter.direction && item.corrected?.direction !== filter.direction) return false
            if (filter.severity && item.corrected?.severity !== filter.severity) return false
            return true
        })
    }, [batch, filter])

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(location.search)

        if (value) params.set(key, value)
        else params.delete(key)

        navigate(`/training?${params.toString()}`)
    }

    const startRetraining = async () => {
        const trainingData = filteredData
        if (filteredData.length === 0) return

        setLoading(true)

        try {
            const datasetSnapshot: DatasetSnapshot = {
                usedInTraining: false,
                shape: filter.shape,
                direction: filter.direction,
                severity: filter.severity,
                orderByField: "createdAt",
                orderDirection: "desc"
            }
            const scores = trainingData.map(item => getDisagreementScore(item))
            const batchScore =
                scores.length > 0
                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    : 0
            const jobRef = await addDoc(collection(db, "training_jobs"), {
                status: "queued",
                datasetSnapshot,
                datasetSize: trainingData.length,
                disagreementScore: batchScore,
                createdAt: new Date(),
                startedAt: null,
                completedAt: null,
                modelVersion: null,
                notes: "Triggered from dashboard batch view"
            })

            // for testing now, replace in future with:
            // await callRetrainingAPI(jobRef.id)

            await updateJobStatus(jobRef.id, "running", {
                startedAt: new Date()
            })

            await runTraining({
                jobId: jobRef.id,
                datasetSize: trainingData.length,
                trainingData: trainingData,
                disagreementScore: batchScore
            })
        } catch (error) {
            console.error("Retraining failed", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const q = buildCorrectionsQuery({
            usedInTraining: false,
            pageSize: PAGE_SIZE,
            orderByField: "createdAt",
            orderDirection: "desc"
    })

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Correction[]
            setBatch(data)
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
            setHasMore(snapshot.docs.length === PAGE_SIZE)
        })
        return () => unsub()
    }, [])

    const loadMore = async () => {
        if (!lastDoc) return

        const nextQ = buildCorrectionsQuery({
            usedInTraining: false,
            pageSize: PAGE_SIZE,
            cursor: lastDoc,
            orderByField: "createdAt",
            orderDirection: "desc"
    })

        const snapshot = await getDocs(nextQ)

        const newData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Correction[]

        setBatch(prev => [...prev, ...newData])
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
        setHasMore(snapshot.docs.length === PAGE_SIZE)
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
            <h1 className="text-2x1 font-bold mb-6">
                Training Queue
            </h1>

            <p className="mb-4 text-gray-600">
                {filteredData.length} samples ready for next training cycle
            </p>

            <div className="flex-col">
                <button
                    onClick={startRetraining}
                    disabled={loading || batch.length === 0}
                    className="bg-green-600 disable:bg-gray-400 text-white px-4 py-2 rounded mb-6"
                >
                    {loading ? "Training..." : "Start Retraining"}
                </button>

                <TrainingJobLiveView />

                {(filter.shape || filter.direction || filter.severity) && (
                    <p className="text-sm text-blue-600 mb-2">
                        Filtering by: {" "}
                        {filter.shape && `Shape: ${filter.shape} `}
                        {filter.direction && `Direction: ${filter.direction} `}
                        {filter.severity && `Severity: ${filter.severity} `}
                    </p>
                )}
                <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4 flex-wrap">
                    <select
                        value={filter.shape ?? ""}
                        onChange={(e) => updateParam("shape", e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Shapes</option>
                        <option value="line">Line</option>
                        <option value="curve">Curve</option>
                        <option value="web">Web</option>
                    </select>

                    <select
                        value={filter.direction ?? ""}
                        onChange={(e) => updateParam("direction", e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Directions</option>
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="diagonal">Diagonal</option>
                    </select>

                    <select
                        value={filter.severity ?? ""}
                        onChange={(e) => updateParam("severity", e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Severities</option>
                        <option value="minor">Minor</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                    </select>
                    
                    <button
                        onClick={(() => navigate("/training"))}
                        className="bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Clear Filter
                    </button>
                </div>
                
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mb-6">
                <div className="grid grid-cols-1 md: grid-cols-2 lg: grid-cols-3 gap-4">
                    {filteredData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow border border-slate-200 p-4 hover:shadow-md transition"
                        >
                            <img
                                src={item.imageUrl}
                                className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="font-semibold">
                                            Predicted:
                                        </span>{" "}
                                        {item.predicted?.shape} / {item.predicted?.direction} / {item.predicted?.severity}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Corrected:
                                        </span>{" "}
                                        {item.corrected?.shape} / {item.corrected?.direction} / {item.corrected?.severity}
                                    </p>

                                    <p className="text-gray-500">
                                        Status: {item.status}
                                    </p>

                                    <DisagreementBadge item={item} />
                                </div>

                                <button
                                    onClick={() => 
                                        setExpandedId(expandedId === item.id ? null : item.id)
                                    }
                                    className="mt-3 text-blue-600 hover:underline text-sm"
                                >
                                    {expandedId === item.id ? "Hide details" : "View details"}
                                </button>
                                {expandedId === item.id && (
                                    <div className="mt-3 text-sm bg-slate-500 p-3 rounded-lg">
                                        <p><b>Predicted:</b> {JSON.stringify(item.predicted)}</p>
                                        <p><b>Corrected:</b> {JSON.stringify(item.corrected)}</p>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-6 gap-3">
                    <button
                        disabled={!hasMore}
                        onClick={loadMore}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                    >
                        Load More
                    </button>
                </div>
            </div>
        </div>
    )
}