export function incrementVersion(version: string): string {
    const cleaned = version.replace("v", "")
    const [major, minor, patch] = cleaned.split(".").map(Number)

    return `v${major}.${minor}.${patch + 1}`
}