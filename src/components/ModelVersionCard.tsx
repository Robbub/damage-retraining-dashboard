import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"

type ModelVersion = {
    currentVersion: string
    lastUpdated: any
    status: string
}

export default function ModelVersionCard() {
    const [model, setModel] = useState<ModelVersion | null>(null)

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "model_versions"), (snapshot) => {
            if (!snapshot.empty) {
                setModel(snapshot.docs[0].data() as ModelVersion)
            }
        })
        return () => unsub()
    }, [])

    if (!model) {
        return (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
                Loadign model info...
            </div>
        )
    }
    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-6">
            <h2 className="text-x1 font-bold mb-3">
                Current Model Version
            </h2>
            
            <p className="text-lg font-semibold text-blue-600">
                {model.currentVersion}
            </p>

            <p className="text-gray-600 mt-2">
                Last Updated:{" "}
                {model.lastUpdated?.toDate?.().toLocaleString?.() ?? "-"}
            </p>

            <p className="mt-2">
                Status:{" "}
                <span className="text-green-600 font-medium">
                    {model.status}
                </span>
            </p>
        </div>
    )
}