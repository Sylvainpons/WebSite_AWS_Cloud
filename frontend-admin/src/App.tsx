import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import SubCategories from './pages/SubCategories'
import Items from './pages/Items'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d1f35', color: '#e2e8f0', border: '1px solid #1e3a5f', fontSize: '14px' },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#040810' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subcategories" element={<SubCategories />} />
            <Route path="/items" element={<Items />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
