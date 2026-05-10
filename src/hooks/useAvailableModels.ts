import { db } from "../firebase"
import { useEffect, useState } from "react"
import { query, collection, where, onSnapshot } from "firebase/firestore"

export function useAvailableModels() {
    const [availableModels, setAvailableModels] = useState<string[]>([])

    useEffect(() => {
        const q = query(
            collection(db, "model_list"),
            where("available", "==", true),
            where("active", "==", false)
        )

        const unsub = onSnapshot(q, (snapshot) => {
            const models = snapshot.docs.map(doc => doc.data().version)
            setAvailableModels(models)
        })

        return () => unsub()
    }, [])
    return availableModels
}