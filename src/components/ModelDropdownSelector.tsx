type Props = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

export function ModelSelector({ value, options, onChange }: Props) {
    return (
        <select
            className="bg-white shadow-md border border-slate-200 p-1 mb-6"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((model) => (
                <option key={model} value={model}>
                    Model {model}
                </option>
            ))}
        </select>
    );
}