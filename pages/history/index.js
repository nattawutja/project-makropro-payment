// app/history/page.tsx - Updated with Order Counts (Complete)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  Database,
  ShoppingCart,
  DollarSign,
  Eye
} from 'lucide-react'


const user = {
  userId: "u001",
  username: "johndoe",
  role: "admin"
};

// interface User {
//   userId: string
//   username: string
//   role: string
// }

// interface BatchHistory {
//   id: string
//   batchId: string
//   fileName: string
//   status: string
//   totalRecords: number
//   processedRecords: number
//   transferredItems: number          // ✅ รายการที่โอนแล้ว (main table)
//   totalActiveItems: number          // ✅ รายการทั้งหมด (temp + main)
//   transferredOrders: number         // ✅ ออเดอร์ที่โอนแล้ว
//   totalActiveOrders: number         // ✅ ออเดอร์ทั้งหมด
//   storeType?: string
//   opcus?: string
//   uploadedBy?: string
//   uploadedAt: string
//   completedAt?: string
//   errorMessage?: string
//   progressPercentage: number
//   duration?: number
//   // Legacy fields (เก็บไว้เผื่อใช้)
//   activeItems: number
//   uniqueOrders: number
// }

// interface HistoryResponse {
//   success: boolean
//   message: string
//   data: {
//     batches: BatchHistory[]
//     pagination: {
//       page: number
//       limit: number
//       total: number
//       totalPages: number
//       hasMore: boolean
//     }
//     stats: {
//       totalBatches: number
//       completedBatches: number
//       errorBatches: number
//       pendingBatches: number
//       totalRecords: number            // ✅ รายการจริงทั้งหมด (temp + main)
//       processedRecords: number        // ✅ รายการที่โอนแล้ว (main table)
//       transferredRecords: number
//       totalAmount: number
//       // ✅ เพิ่มข้อมูลร้านค้า
//       stores: {
//         waiwai: {
//           items: number
//           orders: number
//           amount: number
//         }
//         suda: {
//           items: number
//           orders: number
//           amount: number
//         }
//       }
//     }
//     filters: {
//       search: string
//       status: string
//       dateRange: string
//     }
//   }
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

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay,
  loading = false
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="hover:shadow-xl transition-all duration-300"
  >
    <div className="rounded-xl bg-white shadow-xl text-center  px-3 py-5 hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          {/* {loading ? (
            <div className="flex items-center space-x-2">
              <div className="spinner w-5 h-5"></div>
              <span className="text-gray-400">กำลังโหลด...</span>
            </div>
          ) : ( */}
            <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          {/* )} */}
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </motion.div>
)

export default function HistoryPage() {
  const [user, setUser] = useState(null)
  const [historyData, setHistoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [toast, setToast] = useState({
    show: '',
    message: '',
    type: 'success'
  })
  
  const router = useRouter()

  const showToast = (message,type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 5000)
  }

//   useEffect(() => {
//     // ตรวจสอบการ login
//     const token = localStorage.getItem('token')
//     const userData = localStorage.getItem('user')
    
//     if (!token || !userData) {
//       router.push('/')
//       return
//     }

//     try {
//       const parsedUser = JSON.parse(userData)
//       setUser(parsedUser)
//       console.log('👤 User loaded:', parsedUser)
      
//       // โหลดข้อมูล history
//       loadHistoryData()
//     } catch (error) {
//       console.error('❌ Error parsing user data:', error)
//       router.push('/')
//     }
//   }, [router])

  // เมื่อ filters เปลี่ยน ให้รีเซ็ต page เป็น 1 และโหลดข้อมูลใหม่
  useEffect(() => {
    if (user) {
      setCurrentPage(1)
      loadHistoryData(1)
    }
  }, [searchTerm, statusFilter, dateRangeFilter])

  // เมื่อ page เปลี่ยน
  useEffect(() => {
    if (user && currentPage > 1) {
      loadHistoryData(currentPage)
    }
  }, [currentPage])

  const loadHistoryData = async (page = 1, showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        setRefreshing(true)
      }

      console.log('📊 Loading history data...', { 
        page, 
        search: searchTerm, 
        status: statusFilter, 
        dateRange: dateRangeFilter 
      })
      
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        status: statusFilter,
        dateRange: dateRangeFilter
      })
      
      const response = await fetch(`/api/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('📈 History response:', result)
      
      if (result.success && result.data) {
        setHistoryData(result.data)
        console.log('✅ History data loaded successfully:', {
          batches: result.data.batches.length,
          total: result.data.pagination.total,
          stats: result.data.stats
        })
        
        if (showLoadingToast) {
          showToast('รีเฟรชข้อมูลสำเร็จ', 'success')
        }
      } else {
        throw new Error(result.message || 'Failed to load history')
      }
    } catch (error) {
      console.error('❌ Error loading history data:', error)
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  
  const handleViewDetails = (batchId) => {
    console.log('👀 Navigating to preview:', batchId)
    router.push(`/preview/${batchId}`)
  }

  const handleRefresh = () => {
    loadHistoryData(currentPage, true)
  }

  const handlePageChange = (newPage) => {
    if (historyData && newPage >= 1 && newPage <= historyData.pagination.totalPages) {
      setCurrentPage(newPage)
    }
  }

  // ✅ ฟังก์ชันสำหรับจัดรูปแบบข้อความแสดงรายการและออเดอร์
  const formatItemsAndOrders = (items, orders) => {
    if (orders > 0) {
      return `${items.toLocaleString()} รายการ (${orders.toLocaleString()} ออเดอร์)`
    }
    return `${items.toLocaleString()} รายการ`
  }

  // ✅ ฟังก์ชันสำหรับแสดงจำนวนรายการในตาราง
  const formatProgressText = (batch) => {
    const transferred = batch.transferredItems || 0
    const total = batch.totalActiveItems || 0
    
    if (total === 0) return '0 / 0'
    
    return `${transferred.toLocaleString()} / ${total.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '-'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}นาที ${remainingSeconds}วินาที`
    }
    return `${remainingSeconds}วินาที`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'SENT_TO_AS400':
        return 'status-success'
      case 'ERROR':
        return 'status-error'
      case 'PROCESSING':
        return 'status-warning'
      case 'UPLOADED':
        return 'status-info'
      default:
        return 'status-pending'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'เสร็จสิ้น'
      case 'SENT_TO_AS400':
        return 'โอนแล้ว'
      case 'ERROR':
        return 'ผิดพลาด'
      case 'PROCESSING':
        return 'กำลังประมวลผล'
      case 'UPLOADED':
        return 'อัพโหลดแล้ว'
      default:
        return status
    }
  }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
//         <motion.header
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white shadow-lg border-b border-gray-100"
//         >
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center py-4">
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="bg-gray-200 flex items-center space-x-2 disabled:opacity-50 py-3 px-4 border rounded-lg mr-4 shadow-lg" 
//               >
//                 <ArrowLeft className="w-4 h-4 text-black" />
//                 <span className='text-black'>กลับ</span>
//               </button>
//               <div>
//                 <h1 className="text-xl font-bold gradient-text">ประวัติการอัพโหลด</h1>
//                 <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
//               </div>
//             </div>
//           </div>
//         </motion.header>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="card">
//                 <div className="card-body">
//                   <div className="flex items-center justify-between">
//                     <div className="space-y-2">
//                       <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
//                       <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
//                     </div>
//                     <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

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
        className="bg-white shadow-lg border-b border-gray-100 "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-100 flex items-center space-x-2 disabled:opacity-50 py-3 px-6 border rounded-xl mr-4 shadow-lg hover:bg-gray-300" 
              >
                <ArrowLeft className="w-4 h-4 text-black" />
                <span className="text-black">กลับ</span>
              </button>
              <div>
                <h1 className="text-xl font-bold gradient-text">ประวัติการอัพโหลด</h1>
                <p className="text-sm text-gray-600">ตรวจสอบประวัติการอัพโหลดและโอนข้อมูล</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-100 flex items-center space-x-2 disabled:opacity-50 py-3 px-6 border rounded-lg mr-4 shadow-lg hover:bg-gray-300" 
            >
              <RefreshCw className={`w-4 h-4 text-black ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-black">รีเฟรช</span>
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards with Order Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="ไฟล์ทั้งหมด"
            value={historyData?.stats.totalBatches || 0}
            subtitle={`โอนแล้ว ${historyData?.stats.completedBatches || 0} ไฟล์`}
            icon={FileSpreadsheet}
            color="bg-blue-500"
            delay={0.1}
            loading={!historyData}
          />
          <StatsCard
            title="รายการทั้งหมด"
            value={historyData?.stats.totalRecords || 0}
            subtitle={`โอนแล้ว ${historyData?.stats.processedRecords || 0} รายการ`}
            icon={Package}
            color="bg-green-500"
            delay={0.2}
            loading={!historyData}
          />
          <StatsCard
            title="สถานะ"
            value={`${historyData?.stats.pendingBatches || 0} รอดำเนินการ`}
            subtitle={`${historyData?.stats.errorBatches || 0} ผิดพลาด`}
            icon={Clock}
            color="bg-yellow-500"
            delay={0.3}
            loading={!historyData}
          />
          <StatsCard
            title="ยอดเงินรวม"
            value={historyData ? `฿${historyData.stats.totalAmount.toLocaleString()}` : '฿0'}
            subtitle={`โอนแล้ว ${historyData?.stats.processedRecords || 0} รายการ`}
            icon={DollarSign}
            color="bg-purple-500"
            delay={0.4}
            loading={!historyData}
          />
        </div>

        {/* Advanced Stats Cards - แยกตามร้านค้าและประสิทธิภาพ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* ร้านไวไว */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg px-2 py-3 bg-white shadow-lg"
          >
            <div className="border-b px-2 py-2">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">ร้านไวไว</h3>
              </div>
            </div>
            <div className="card-body mt-3">
              {/* {!historyData ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-5 h-5"></div>
                  <span className="text-gray-400">กำลังโหลด...</span>
                </div>
              ) : ( */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-gray-600 text-sm">ออเดอร์ทั้งหมด</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {/* {historyData.stats.stores.waiwai.orders.toLocaleString()} ออเดอร์ */}
                    </div>
                    <div className="text-sm text-gray-500">
                      {/* ({historyData.stats.stores.waiwai.items.toLocaleString()} รายการ) */}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-600 text-sm">ยอดเงินรวม</span>
                    <div className="text-xl font-semibold text-green-600">
                      {/* ฿{historyData.stats.stores.waiwai.amount.toLocaleString()} */}
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <div className="flex justify-between mb-1">
                        <span>OPCUS:</span>
                        <span className="font-medium">988899</span>
                      </div>
                      <div className="flex justify-between">
                        <span>สถานะ:</span>
                        <span className="text-green-600 font-medium">ใช้งานได้</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/* )} */}
            </div>
          </motion.div>

          {/* ร้านซือดะ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-lg px-2 py-3 bg-white shadow-lg"
          >
            <div className="border-b px-2 py-2">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">ร้านซือดะ</h3>
              </div>
            </div>
            <div className="mt-3">
              {/* {!historyData ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-5 h-5"></div>
                  <span className="text-gray-400">กำลังโหลด...</span>
                </div>
              ) : ( */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-gray-600 text-sm">ออเดอร์ทั้งหมด</span>
                    <div className="text-2xl font-bold text-orange-600">
                      {/* {historyData.stats.stores.suda.orders.toLocaleString()} ออเดอร์ */}
                    </div>
                    <div className="text-sm text-gray-500">
                      {/* ({historyData.stats.stores.suda.items.toLocaleString()} รายการ) */}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-600 text-sm">ยอดเงินรวม</span>
                    <div className="text-xl font-semibold text-green-600">
                      {/* ฿{historyData.stats.stores.suda.amount.toLocaleString()} */}
                    </div>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-3">
                    <div className="text-sm text-orange-800">
                      <div className="flex justify-between mb-1">
                        <span>OPCUS:</span>
                        <span className="font-medium">989902</span>
                      </div>
                      <div className="flex justify-between">
                        <span>สถานะ:</span>
                        <span className="text-green-600 font-medium">ใช้งานได้</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/* )} */}
            </div>
          </motion.div>

          {/* ประสิทธิภาพและข้อมูลระบบ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg px-2 py-3 bg-white shadow-lg"
          >
            <div className="border-b px-2 py-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">ประสิทธิภาพ & ระบบ</h3>
              </div>
            </div>
            <div className="mt-3">
              {/* {!historyData ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-5 h-5"></div>
                  <span className="text-gray-400">กำลังโหลด...</span>
                </div>
              ) : ( */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ออเดอร์ทั้งหมด:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {/* {(historyData.stats.stores.waiwai.orders + historyData.stats.stores.suda.orders).toLocaleString()} ออเดอร์ */}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">รายการเสร็จสิ้น:</span>
                    <span className="text-xl font-semibold text-blue-600">
                      {/* {historyData.stats.processedRecords.toLocaleString()} รายการ */}
                    </span>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-800">ความคืบหน้า:</span>
                      <span className="text-green-800 font-medium">
                        {/* {historyData.stats.totalRecords > 0 
                          ? Math.round((historyData.stats.processedRecords / historyData.stats.totalRecords) * 100)
                          : 0
                        }% */}
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        // style={{ 
                        //   width: `${historyData.stats.totalRecords > 0 
                        //     ? (historyData.stats.processedRecords / historyData.stats.totalRecords) * 100
                        //     : 0
                        //   }%` 
                        // }}
                      ></div>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">รายการที่บันทึก:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {/* {historyData.stats.transferredRecords.toLocaleString()} */}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">สถานะการเชื่อมต่อ:</span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">ปกติ</span>
                      </span>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-2">
                      <div className="text-xs text-blue-800">
                        <div className="flex justify-between mb-1">
                          <span>PostgreSQL:</span>
                          <span className="font-medium">เชื่อมต่อแล้ว</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AS400:</span>
                          <span className="font-medium">พร้อมใช้งาน</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/* )} */}
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        className="rounded-lg px-2 py-3 bg-white shadow-lg"
        >
            <div className="px-2 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative border rounded-xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                        type="text"
                        placeholder="ค้นหาชื่อไฟล์, Batch ID, ผู้อัพโหลด"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-gray-900 form-input pl-12 w-full bg-white py-3 focus:rounded-lg"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative border rounded-xl bg-gray-200">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input pl-12 w-full bg-gray-200 text-gray-800 mt-3 "
                        >
                            <option value="all">ทุกสถานะ</option>
                            <option value="COMPLETED">เสร็จสิ้น</option>
                            <option value="SENT_TO_AS400">โอนแล้ว</option>
                            <option value="PROCESSING">กำลังประมวลผล</option>
                            <option value="UPLOADED">อัพโหลดแล้ว</option>
                            <option value="ERROR">ผิดพลาด</option>
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="relative border rounded-xl bg-gray-200">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                        value={dateRangeFilter}
                        onChange={(e) => setDateRangeFilter(e.target.value)}
                        className="form-input pl-12 w-full bg-gray-200 text-gray-800 mt-3"
                        >
                        <option value="all">ทุกช่วงเวลา</option>
                        <option value="today">วันนี้</option>
                        <option value="week">7 วันที่แล้ว</option>
                        <option value="month">เดือนที่แล้ว</option>
                        <option value="quarter">3 เดือนที่แล้ว</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setDateRangeFilter('all')
                        }}
                        className="btn-secondary w-full border rounded-lg shadow-lg text-gray-800 bg-gray-100 hover:bg-gray-200" 
                    >
                        ล้างตัวกรอง
                    </button>
                </div>
            </div>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-lg px-2 py-3 bg-white shadow-lg mt-10"
        >
          <div className="px-4 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  ประวัติการอัพโหลด 
                  {historyData && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({historyData.pagination.total} รายการ)
                    </span>
                  )}
                </h3>
              </div>
              
              {historyData && historyData.pagination.totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    หน้า {historyData.pagination.page} จาก {historyData.pagination.totalPages}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card-body p-0">
            <div className="overflow-x-auto sm:rounded-lg mt-3">
              <table className="w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ชื่อไฟล์</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">สถานะ</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">จำนวนรายการ</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ความคืบหน้า</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ร้านค้า</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ผู้อัพโหลด</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">วันที่อัพโหลด</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ระยะเวลา</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData && historyData.batches.length > 0 ? (
                    historyData.batches.map((batch, index) => (
                      <motion.tr
                        key={batch.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="font-medium text-gray-900">
                          <div className="flex items-center space-x-2">
                            <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                            <span>{batch.fileName}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {batch.batchId.slice(-8)}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                          {batch.errorMessage && (
                            <div className="text-xs text-red-600 mt-1" title={batch.errorMessage}>
                              {batch.errorMessage.length > 30 
                                ? `${batch.errorMessage.substring(0, 30)}...` 
                                : batch.errorMessage
                              }
                            </div>
                          )}
                        </td>
                        <td>
                          {/* ✅ แสดงจำนวนรายการที่อัพโหลดแล้ว / จำนวนรายการทั้งหมด */}
                          <div className="text-sm font-medium text-gray-900">
                            {formatProgressText(batch)}
                          </div>
                          {batch.totalActiveOrders > 0 && (
                            <div className="text-xs text-gray-500">
                              ออเดอร์: {batch.transferredOrders} / {batch.totalActiveOrders}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{batch.progressPercentage}%</span>
                              <span className="text-gray-500">
                                {batch.transferredItems || 0}/{batch.totalActiveItems || 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  batch.progressPercentage === 100 ? 'bg-green-500' :
                                  batch.progressPercentage > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                                style={{ width: `${batch.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {batch.storeType ? (
                            <div>
                              <span className={`status-badge ${
                                batch.storeType === 'WAIWAI' ? 'status-info' : 'status-warning'
                              }`}>
                                {batch.storeType === 'WAIWAI' ? 'ไวไว' : 'ซือดะ'}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {batch.opcus}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-gray-900">
                          {batch.uploadedBy || '-'}
                        </td>
                        <td className="text-gray-900">
                          <div className="text-sm">{formatDate(batch.uploadedAt)}</div>
                          {batch.completedAt && (
                            <div className="text-xs text-gray-500">
                              เสร็จ: {formatDate(batch.completedAt)}
                            </div>
                          )}
                        </td>
                        <td className="text-gray-900">
                          {formatDuration(batch.duration)}
                        </td>
                        <td className="text-gray-900 text-center">
                          <button
                                onClick={() => handleViewDetails(batch.batchId)}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีข้อมูล</h3>
                        <p className="text-gray-600">
                          {searchTerm || statusFilter !== 'all' || dateRangeFilter !== 'all'
                            ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                            : 'ยังไม่มีการอัพโหลดไฟล์'
                          }
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {historyData && historyData.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    แสดง {((historyData.pagination.page - 1) * 20) + 1} - {
                      Math.min(historyData.pagination.page * 20, historyData.pagination.total)
                    } จาก {historyData.pagination.total.toLocaleString()} รายการ
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>ก่อนหน้า</span>
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, historyData.pagination.totalPages) }, (_, i) => {
                        let pageNumber
                        if (historyData.pagination.totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (currentPage >= historyData.pagination.totalPages - 2) {
                          pageNumber = historyData.pagination.totalPages - 4 + i
                        } else {
                          pageNumber = currentPage - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              pageNumber === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === historyData.pagination.totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>ถัดไป</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}