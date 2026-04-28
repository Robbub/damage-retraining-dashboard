import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot, addDoc, getDocs, updateDoc, doc } from "firebase/firestore"
import { type Correction } from "./common/interface"
import { incrementVersion } from "../utils/versioning"
import React from "react"

export default function TrainingQueuePage() {
    const [batch, setBatch] = useState<Correction[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const startRetraining = async () => {
        if (batch.length === 0) return

        setLoading(true)

        try {
            const jobRef = await addDoc(collection(db, "training_jobs"), {
                status: "queued",
                datasetSize: batch.length,
                createdAt: new Date(),
                startedAt: null,
                completedAt: null,
                modelVersion: null,
                notes: "Triggered from dashboard batch view"
            })

            // for testing now, replace in future with:
            // await callRetrainingAPI(jobRef.id)

            setTimeout(async () => {
                await updateDoc(doc(db, "training_jobs", jobRef.id), {
                    status: "running",
                    startedAt: new Date(),
                })

                try {
                    setTimeout(async () => {
                        const versionSnapshot = await getDocs(collection(db, "model_versions"))
                        const versionDoc = versionSnapshot.docs[0]
                        const currentVersion = versionDoc.data().currentVersion
                        const nextVersion = incrementVersion(currentVersion)

                        await updateDoc(versionDoc.ref, {
                            currentVersion: nextVersion,
                            lastUpdated: new Date(),
                            status: "active",
                        })

                        await updateDoc(doc(db, "training_jobs", jobRef.id), {
                            status: "completed",
                            completedAt: new Date(),
                            modelVersion: nextVersion,
                        })

                        for (const item of batch) {
                            await updateDoc(doc(db, "corrections", item.id), {
                                usedInTraining: true,
                            })
                        }
                    }, 5000)
                } catch (error) {
                    console.error("Completion update failed", error)
                }
            }, 2000)
        } catch (error) {
            console.error("Retraining failed", error)
        }
    }

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "corrections"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Correction[]
            setBatch(data.filter(c => !c.usedInTraining))
        })
        return () => unsub()
    }, [])
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
            <h1 className="text-2x1 font-bold mb-6">
                Training Queue
            </h1>

            <p className="mb-4 text-gray-600">
                {batch.length} samples ready for next training cycle
            </p>

            <button
                onClick={startRetraining}
                disabled={loading || batch.length === 0}
                className="bg-green-600 disable:bg-gray-400 text-white px-4 py-2 rounded mb-6"
            >
                {loading ? "Training..." : "Start Retraining"}
            </button>

            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mb-6">
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-br from-slate-100 to-blue-50">
                        <tr>
                            <th className="p-3">Image</th>
                            <th className="p-3">Predicted</th>
                            <th className="p-3">Corrected</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {batch.map((item) => (
                            <React.Fragment key={item.id}>
                                <tr
                                    key={item.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="p-3">
                                        <img
                                            src={item.imageUrl}
                                            className="w-12 h-12 object-over rounded"
                                        />
                                    </td>
                                    <td className="p-3">{item.predictedClass}</td>
                                    <td className="p-3">{item.correctedClass}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => 
                                                setExpandedId(
                                                    expandedId === item.id ? null : item.id
                                                )
                                            }
                                            className="text-blue-600 hover:underline"
                                        >
                                            {expandedId === item.id ? "Hide" : "View"}
                                        </button>
                                    </td>
                                </tr>

                                {expandedId === item.id && (
                                    <tr className="bg-gray-500">
                                        <td colSpan={4} className="p-4">
                                            <div className="flex gap-4">
                                                <img
                                                    src={item.imageUrl}
                                                    className="w-40 h-40 object-cover rounded"
                                                />
                                                <div>
                                                    <p>
                                                        <span className="font-semibold">
                                                            Predicted:
                                                        </span>{" "}
                                                        {item.predictedClass}
                                                    </p>

                                                    <p>
                                                        <span className="font-semibold">
                                                            Corrected:
                                                        </span>{" "}
                                                        {item.correctedClass}
                                                    </p>

                                                    <p>
                                                        <span className="font-semibold">
                                                            Status:
                                                        </span>{" "}
                                                        {item.status}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}