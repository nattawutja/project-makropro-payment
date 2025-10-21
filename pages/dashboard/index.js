// app/dashboard/page.tsx - Updated to support order counts
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from "next/image";
import { 
  Upload, 
  FileSpreadsheet, 
  Eye, 
  Send, 
  LogOut, 
  User,
  Calendar,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Database,
  Activity,
  DollarSign,
  Package
} from 'lucide-react'

const user = {
  userId: "u001",
  username: "johndoe",
  role: "admin"
};

// interface DashboardStats {
//   batches: {
//     total: number
//     completed: number
//     pending: number
//     error: number
//   }
//   records: {
//     total: number
//     totalOrders?: number        // ✅ เพิ่มจำนวนออเดอร์รวม
//     pendingItems?: number      // ✅ รายการที่รอโอน
//     pendingOrders?: number     // ✅ ออเดอร์ที่รอโอน
//     completedItems?: number    // ✅ รายการที่เสร็จแล้ว
//     completedOrders?: number   // ✅ ออเดอร์ที่เสร็จแล้ว
//     totalAmount: number
//   }
//   stores: {
//     waiwai: {
//       records: number
//       orders: number           // ✅ จำนวนออเดอร์ร้านไวไว
//       amount: number
//     }
//     suda: {
//       records: number
//       orders: number           // ✅ จำนวนออเดอร์ร้านซือดะ
//       amount: number
//     }
//   }
//   recentActivities: Array<{
//     id: string
//     action: string
//     status: string
//     message: string
//     batchId?: string
//     userId?: string
//     createdAt: string
//     details?: any
//   }>
//   dailyStats?: Array<{
//     date: string
//     status: string
//     records: number
//   }>
//   recentTransfers?: Array<{
//     id: string
//     orderNo: string
//     storeType: string
//     totalAmount: number
//     transferredAt?: string
//     reference?: string
//   }>
// }

const Toast = ({ message, type, onClose }) => { 
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2`}
    >
      <AlertCircle size={20} />
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </motion.div>
  )
}


const StatsCard = ({title,value,subtitle,icon: Icon,color,delay,loading = false }) => (
    <div className="rounded-lg bg-white card-body shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="spinner w-5 h-5"></div>
              <span className="text-gray-400">กำลังโหลด...</span>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div
          className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
);

const ActivityItem = ({ activity, index }) => {
  const getActivityIcon = (action) => {
    if (action.includes("UPLOAD")) return Upload;
    if (action.includes("TRANSFER")) return Send;
    if (action.includes("LOGIN")) return User;
    return Activity;
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "ERROR":
        return "bg-red-500";
      case "WARNING":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const Icon = getActivityIcon(activity.action);
  const colorClass = getActivityColor(activity.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className={`${colorClass} p-2 rounded-lg`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{activity.message}</p>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{new Date(activity.createdAt).toLocaleDateString("th-TH")}</span>
          <span>•</span>
          <span>{new Date(activity.createdAt).toLocaleTimeString("th-TH")}</span>
          {activity.batchId && (
            <>
              <span>•</span>
              <span className="font-mono text-xs">
                {activity.batchId.slice(-8)}
              </span>
            </>
          )}
        </div>
      </div>
      <span
        className={`status-badge ${
          activity.status === "SUCCESS"
            ? "status-success"
            : activity.status === "ERROR"
            ? "status-error"
            : activity.status === "WARNING"
            ? "status-warning"
            : "status-info"
        }`}
      >
        {activity.status === "SUCCESS"
          ? "สำเร็จ"
          : activity.status === "ERROR"
          ? "ผิดพลาด"
          : activity.status === "WARNING"
          ? "คำเตือน"
          : activity.status}
      </span>
    </motion.div>
  );
};

export default function DashboardPage() {

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const router = useRouter()

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  useEffect(() => {
    // ตรวจสอบการ login
    // const token = localStorage.getItem('token')
    // const userData = localStorage.getItem('user')
    
    // if (!token || !userData) {
    //   //router.push('/')
    //   return
    // }

    // try {
    //   const parsedUser = JSON.parse(userData)
    //   setUser(parsedUser)
    //   console.log('👤 User loaded:', parsedUser)
      
    //   // โหลดข้อมูล dashboard stats
    //   loadDashboardStats()
    // } catch (error) {
    //   console.error('❌ Error parsing user data:', error)
    //   router.push('/')
    // }
  }, [])
// [router]
  const loadDashboardStats = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        setRefreshing(true)
      }

      console.log('📊 Loading dashboard stats...')
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('📈 Dashboard stats response:', result)
      
      if (result.success && result.data) {
        setStats(result.data)
        console.log('✅ Dashboard stats loaded successfully:', {
          batches: result.data.batches,
          records: result.data.records,
          activities: result.data.recentActivities.length
        })
        
        if (showLoadingToast) {
          showToast('รีเฟรชข้อมูลสำเร็จ', 'success')
        }
      } else {
        throw new Error(result.message || 'Failed to load stats')
      }
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error)
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    showToast('ออกจากระบบสำเร็จ', 'success')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  const navigateToUpload = () => {
    router.push('/upload')
  }

  const navigateToHistory = () => {
    router.push('/history')
  }

  const handleRefresh = () => {
    loadDashboardStats(true)
  }

  // ✅ ฟังก์ชันสำหรับจัดรูปแบบข้อความที่แสดงรายการและออเดอร์
  const formatItemsAndOrders = (items, orders) => {
    if (orders !== undefined && orders > 0) {
      return `${stats?.records.completedItems} รายการ (${orders.toLocaleString()} ออเดอร์)`
    }
    return `${items.toLocaleString()} รายการ`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/makroprowhite.png"
                alt="My Photo"
                width={50}
                height={20}
                className="border rounded-xl"
                />
              <div>
                <h1 className="text-xl font-bold gradient-text">MakroPro Payment System</h1>
                <p className="text-sm text-gray-600">ระบบจัดการข้อมูลรายการชำระเงิน</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-slate-400 flex items-center space-x-2 disabled:opacity-50 py-2 px-4 border rounded-md transition-all duration-300 hover:-translate-y-1"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>รีเฟรช</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.username}</span>
                <span className="text-sm text-gray-500">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-400 flex items-center space-x-2 disabled:opacity-50 py-2 px-4 border rounded-md transition-all duration-300 hover:-translate-y-1"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            สวัสดีคุณ {user?.username} 👋
          </h2>
          <p className="text-gray-600">
            ระบบจัดการข้อมูลรายการชำระเงินจาก MakroPro
          </p>
        </motion.div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="ไฟล์ที่อัพโหลดทั้งหมด"
            value={stats?.batches.total || 0}
            icon={FileSpreadsheet}
            color="bg-blue-500"
            delay={0.1}
            loading={!stats}
          />
          <StatsCard
            title="รายการรอการโอน"
            value={stats?.records.pendingItems || 0}
            subtitle={stats?.records.pendingOrders ? `${stats.records.pendingOrders} ออเดอร์` : undefined}
            icon={Clock}
            color="bg-yellow-500"
            delay={0.2}
            loading={!stats}
          />
          <StatsCard
            title="รายการโอนสำเร็จ"
            value={stats?.records.completedItems || 0}
            subtitle={stats?.records.completedOrders ? `${stats.records.completedOrders} ออเดอร์` : undefined}
            icon={CheckCircle}
            color="bg-green-500"
            delay={0.3}
            loading={!stats}
          />
          <StatsCard
            title="ยอดเงินรวม"
            value={stats ? `฿${stats.records.totalAmount.toLocaleString()}` : '฿0'}
            subtitle={stats?.records.totalOrders ? `${stats.records.totalOrders} ออเดอร์` : undefined}
            icon={TrendingUp}
            color="bg-purple-500"
            delay={0.4}
            loading={!stats}
          />
        </div>

{/* Store Stats - Updated with left-right alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border px-3 py-2 shadow-lg bg-white rounded-xl"
          >
            <div className="border-b px-2 py-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">ร้านไวไว</h3>
              </div>
            </div>
            <div className="mt-4">
              {/* {loading || !stats ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-5 h-5"></div>
                  <span className="text-gray-400">กำลังโหลด...</span>
                </div>
              ) : ( */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">รายการทั้งหมด:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {/* {stats.stores.waiwai.records.toLocaleString()} รายการ */}
                      </div>
                      <div className="text-sm text-gray-500">
                        {/* ({stats.stores.waiwai.orders.toLocaleString()} ออเดอร์) */}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ยอดเงินรวม:</span>
                    <div className="text-xl font-semibold text-green-600">
                      {/* ฿{stats.stores.waiwai.amount.toLocaleString()} */}
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <div className="flex justify-between mb-1">
                        <span>OPCUS:</span>
                        <span className="font-medium">988899</span>
                      </div>
                      {/*<div className="flex justify-between">
                        <span>สถานะ:</span>
                        <span className="text-green-600 font-medium">ใช้งานได้</span>
                      </div>*/}
                    </div>
                  </div>
                </div>
              {/* )} */}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border px-3 py-2 shadow-lg bg-white rounded-xl"

          >
            <div className="border-b px-2 py-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">ร้านซือดะ</h3>
              </div>
            </div>
            <div className="mt-4">
              {/* {loading || !stats ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-5 h-5"></div>
                  <span className="text-gray-400">กำลังโหลด...</span>
                </div>
              ) : ( */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">รายการทั้งหมด:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {/* {stats.stores.suda.records.toLocaleString()} รายการ */}
                      </div>
                      <div className="text-sm text-gray-500">
                        {/* ({stats.stores.suda.orders.toLocaleString()} ออเดอร์) */}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ยอดเงินรวม:</span>
                    <div className="text-xl font-semibold text-green-600">
                      {/* ฿{stats.stores.suda.amount.toLocaleString()} */}
                    </div>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-3">
                    <div className="text-sm text-orange-800">
                      <div className="flex justify-between mb-1">
                        <span>OPCUS:</span>
                        <span className="font-medium">989902</span>
                      </div>
                      {/*<div className="flex justify-between">
                        <span>สถานะ:</span>
                        <span className="text-green-600 font-medium">ใช้งานได้</span>
                      </div>*/}
                    </div>
                  </div>
                </div>
              {/* )} */}
            </div>
          </motion.div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Upload File Card */}
          
            <div className="shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white"
                 onClick={navigateToUpload}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl mx-auto w-fit mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">อัพโหลดไฟล์</h3>
              <p className="text-gray-600 text-sm mb-4">
                อัพโหลดไฟล์ Excel ข้อมูลการชำระเงินจาก MakroPro
              </p>
              <div className="btn-primary w-full hover:shadow-lg whitespace-nowrap text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" >
                เริ่มอัพโหลด
              </div>
            </div>
  

          {/* View History Card */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={navigateToHistory}
          > */}
            <div className="shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white" onClick={navigateToHistory}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ดูประวัติ</h3>
              <p className="text-gray-600 text-sm mb-4">
                ตรวจสอบประวัติการอัพโหลดและโอนข้อมูล
              </p>
              <div className="btn-primary w-full hover:shadow-lg whitespace-nowrap text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" >
                ดูประวัติ
              </div>
            </div>
          {/* </div></motion.div> */}

          {/* Database Info Card */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
          > */}
            <div className="shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ข้อมูลระบบ</h3>
              <p className="text-gray-600 text-sm mb-4">
                ตรวจสอบสถานะการเชื่อมต่อและข้อมูลระบบ
              </p>
              <div className="btn-primary w-full hover:shadow-lg whitespace-nowrap text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" >
                ดูข้อมูลระบบ
              </div>
            </div>
          {/* </motion.div> */}
        </div>

        {/* Recent Activities */}
{/*        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="card mb-8"
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>รีเฟรช</span>
              </button>
            </div>
          </div>
          <div className="card-body">
            {loading || !stats ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl animate-pulse">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-16 h-6 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 5).map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">ยังไม่มีกิจกรรม</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button 
                onClick={navigateToHistory}
                className="btn-secondary"
              >
                ดูกิจกรรมทั้งหมด
              </button>
            </div>
          </div>
        </motion.div>*/}

        {/* Recent Transfers */}
        {stats && stats.recentTransfers && stats.recentTransfers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="card mb-8"
          >
            <div className="card-header">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">การโอนล่าสุด</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order No.</th>
                      <th>ร้านค้า</th>
                      <th>ยอดเงิน</th>
                      <th>วันที่โอน</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransfers.map((transfer, index) => (
                      <motion.tr
                        key={transfer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <td className="font-mono text-sm">{transfer.orderNo}</td>
                        <td>
                          <span className={`status-badge ${
                            transfer.storeType === 'WAIWAI' ? 'status-info' : 'status-warning'
                          }`}>
                            {transfer.storeType === 'WAIWAI' ? 'ไวไว' : 'ซือดะ'}
                          </span>
                        </td>
                        <td className={`font-medium ${
                          transfer.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ฿{transfer.totalAmount.toLocaleString()}
                        </td>
                        <td>
                          {transfer.transferredAt 
                            ? new Date(transfer.transferredAt).toLocaleDateString('th-TH')
                            : '-'
                          }
                        </td>
                        <td className="font-mono text-xs">{transfer.reference || '-'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* System Info */}
          <div className="bg-white shadow-md rounded-xl p-5 border">
              <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">ข้อมูลระบบ</h3>
              </div>
              <div className="space-y-3 border-t-2">
                  <div className="flex justify-between mt-3">
                      <span className="text-gray-600">เวอร์ชั่นระบบ:</span>
                      <span className="font-medium text-gray-600">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-600">ข้อมูลล่าสุด:</span>
                      <span className="font-medium text-gray-600">
                          {new Date().toLocaleDateString('th-TH')}
                      </span>
                  </div>
              </div>
          </div>

          <div className="bg-white shadow-md rounded-xl p-5 border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">การโอนไฟล์</h3>
            </div>
            <div className="space-y-3 border-t-2">
              <div className="flex justify-between mt-3">
                  <span className="text-gray-600">ไฟล์ที่ประมวลผล:</span>
                  <span className="font-medium text-gray-600">{stats?.batches.total || 0} ไฟล์</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ข้อมูลที่ผิดพลาด:</span>
                <span className="font-medium text-red-600">
                  {stats?.batches.error || 0} ไฟล์
                </span>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  )
}