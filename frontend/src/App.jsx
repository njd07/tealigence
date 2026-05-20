import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Layout from './components/Layout'
import FarmerAdvisory from './components/FarmerAdvisory'
import QualityLab from './components/QualityLab'
import TraderDashboard from './components/TraderDashboard'
import SupplyChain from './components/SupplyChain'
import WeatherAdvisor from './components/WeatherAdvisor'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('tealigence_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/advisory" replace />} />
          <Route path="advisory" element={<FarmerAdvisory />} />
          <Route path="quality" element={<QualityLab />} />
          <Route path="dashboard" element={<TraderDashboard />} />
          <Route path="supply-chain" element={<SupplyChain />} />
          <Route path="weather" element={<WeatherAdvisor />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
