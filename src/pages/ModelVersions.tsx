import { useState, useEffect } from "react"
import { collection, onSnapshot, getDocs, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

type ModelVersion = {
    version: string
    createdAt?: any
    status: string
}

const setActiveVersion = async (targetId: string) => {
    try {
        const snapshot = await getDocs(collection(db, "model_versions"))

        const activeDoc = snapshot.docs.find(
            doc => doc.data().status === "active"
        )

        if (activeDoc && activeDoc.id !== targetId) {
            await updateDoc(activeDoc.ref, {
                status: "archived"
            })
        }

        const targetDoc = snapshot.docs.find(doc => doc.id === targetId)

        if (targetDoc) {
            await updateDoc(targetDoc.ref, {
                status: "active"
            })
        }
    } catch (error) {
        console.error("Rollback failed", error)
    }
}

export default function ModelVersionsPage() {
    const [versions, setVersions] = useState<any[]>([])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "model_versions"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as ModelVersion)
            }))

            data.sort((a, b) => {
                const aTime = a.createdAt?.seconds ?? 0
                const bTime = b.createdAt?.seconds ?? 0
                return bTime - aTime
            })
            setVersions(data)
        })
        return () => unsub()
    }, [])
    return (
        <div className="bg-white rounded-2xl shadow border overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-3">Version</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Dataset</th>
                        <th className="p-3">Disagreement</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {versions.map(v => (
                        <tr key={v.id} className="border-b">
                            <td className="p-3 font-semibold">
                                {v.version}
                                {v.status === "active" && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        LIVE
                                    </span>
                                )}
                            </td>
                            
                            <td className="p-3">
                                <span className={
                                    v.status === "active"
                                        ? "text-green-600 font-bold"
                                        : "text-gray-500"
                                }>
                                    {v.status}
                                </span>
                            </td>

                            <td className="p-3">{v.datasetSize}</td>
                            <td className="p-3">{v.disagreementScore ?? "-"}</td>

                            <td className="p-3">
                                {v.createdAt?.toDate?.().toLocaleDateString?.() ?? "-"}
                            </td>

                            <td className="p-3">
                                {v.status !== "active" && (
                                    <button
                                        onClick={() => {
                                            if (!confirm("Set this version as active?")) return
                                            setActiveVersion(v.id)
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                    >
                                        Set Active
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}