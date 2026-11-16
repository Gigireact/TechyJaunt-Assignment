import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import { Toaster, Loading } from './components/ui'
import { Login, Register, Verify, Forgot } from './pages/Auth'
import { Shop, Product } from './pages/Shop'
import Cart from './pages/Cart'
import Wallet from './pages/Wallet'
import Orders from './pages/Orders'
import Vendor from './pages/Vendor'
import Admin from './pages/Admin'
import Notifications from './pages/Notifications'

const Guard=({role,children})=>{ const {user,loading,has}=useAuth()
  if(loading) return <Loading/>; if(!user) return <Navigate to="/login" replace/>
  if(role&&!has(role)) return <Navigate to="/" replace/>; return children }
export default function App(){
  return <><Toaster/><Routes>
    <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
    <Route path="/verify-email" element={<Verify/>}/><Route path="/forgot-password" element={<Forgot/>}/>
    <Route element={<Layout/>}>
      <Route index element={<Shop/>}/><Route path="products/:slug" element={<Product/>}/>
      <Route path="cart" element={<Guard><Cart/></Guard>}/><Route path="wallet" element={<Guard><Wallet/></Guard>}/>
      <Route path="orders" element={<Guard><Orders/></Guard>}/><Route path="notifications" element={<Guard><Notifications/></Guard>}/>
      <Route path="vendor" element={<Guard><Vendor/></Guard>}/><Route path="admin" element={<Guard role="admin"><Admin/></Guard>}/>
    </Route></Routes></>
}
