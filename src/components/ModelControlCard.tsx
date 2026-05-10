import { ModelSelector } from "./ModelDropdownSelector"

type Props = {
    activeModel: string
    availableModels: string[]
    onModelChange: (model: string) => Promise<void>
    onTriggerBuild: () => Promise<void>
}

export default function ModelControlCard({
    activeModel,
    availableModels,
    onModelChange,
    onTriggerBuild
}: Props) {

    return (
        <div className="h-full bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            
            <h2 className="text-x1 font-bold mb-3">
                Change Model Version
            </h2>

            <div className="flex gap-4 items-start">
                
                <ModelSelector
                    value={activeModel}
                    options={availableModels}
                    onChange={onModelChange}
                />

                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
                    onClick={onTriggerBuild}
                >
                    Build APK
                </button>

            </div>
        </div>
    )
}