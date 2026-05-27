import { Routes, Route, Navigate } from 'react-router'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Computers from './pages/Computers'
import Customers from './pages/Customers'
import ServiceOrders from './pages/ServiceOrders'
import Histories from './pages/Histories'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/computers" element={<Computers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/service-orders" element={<ServiceOrders />} />
          <Route path="/histories" element={<Histories />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
