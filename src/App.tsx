import Dashboard from "./pages/Dashboard"
import BatchView from "./pages/TrainingQueuePage"
import TrainingJobs from "./pages/TrainingJobs"

function App() {
  const path = window.location.pathname
  return (
    <div>
      <div className="p-4 bg-black text-white flex gap-4">
        <button onClick={() => window.location.href = "/"}>
          Dashboard
        </button>

        <button onClick={() => window.location.href = "/batch"}>
          Batch View
        </button>

        <button onClick={() => window.location.href = "/jobs"}>
          Training Jobs
        </button>
      </div>
      {path === "/batch" ? (
        <BatchView />
      ) : path === "/jobs" ? (
        <TrainingJobs />
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

export default App