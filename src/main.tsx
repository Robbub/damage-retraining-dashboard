import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppLayout from './layouts/AppLayout.tsx'
import Dashboard from './pages/Dashboard.tsx'
import TrainingQueuePage from './pages/TrainingQueuePage.tsx'
import TrainingJobs from './pages/TrainingJobs.tsx'
import ModelVersionsPage from './pages/ModelVersions.tsx'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training" element={<TrainingQueuePage />} />
          <Route path="/jobs" element={<TrainingJobs />} />
          <Route path="/model-version" element={<ModelVersionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
