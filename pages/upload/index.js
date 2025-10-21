'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileSpreadsheet, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  X,
  Eye,
  Download,
  RefreshCw,
  Database,
  Server,
  AlertTriangle,
  Info,
  XCircle,
  ChevronDown,
  ChevronUp,
  Store,
  Building2
} from 'lucide-react'

const user = {
  userId: "u001",
  username: "johndoe",
  role: "admin"
};

const Toast = ({ message, type, onClose }) => { 
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500'

  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

const DuplicateInfoCard = ({ duplicateInfo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 mb-6 ${
        duplicateInfo.hasDuplicates 
          ? 'bg-yellow-50 border border-yellow-200' 
          : 'bg-green-50 border border-green-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {duplicateInfo.hasDuplicates ? (
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h4 className={`font-semibold mb-2 ${
            duplicateInfo.hasDuplicates ? 'text-yellow-900' : 'text-green-900'
          }`}>
            {duplicateInfo.hasDuplicates 
              ? `พบข้อมูลซ้ำ ${duplicateInfo.duplicateCount} รายการ`
              : 'ไม่พบข้อมูลซ้ำ'
            }
          </h4>
          
          {duplicateInfo.hasDuplicates && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">ตาราง Main</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{duplicateInfo.duplicateInMain}</p>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">ระบบ AS400</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{duplicateInfo.duplicateInAS400}</p>
              </div>
            </div>
          )}

          {duplicateInfo.duplicateDetails && duplicateInfo.duplicateDetails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-800 text-sm">รายการซ้ำ:</h5>
                <span className="text-xs text-gray-500">
                  แสดงทั้งหมด {duplicateInfo.duplicateDetails.length} รายการ
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white bg-opacity-30">
                {duplicateInfo.duplicateDetails.map((dup, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-white bg-opacity-80 rounded p-3 shadow-sm">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="font-mono text-gray-800 font-semibold bg-gray-100 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <code className="font-mono text-gray-800 font-medium">
                        {dup.orderNo}
                      </code>
                      <div className="flex items-center space-x-1">
                        {dup.location === 'main_table' ? (
                          <Database className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Server className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="text-gray-600 font-medium">
                          {dup.location === 'main_table' ? 'ตาราง Main' : 'ระบบ AS400'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dup.location === 'main_table' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-orange-100 text-orange-800 border border-orange-200'
                      }`}>
                        {dup.location === 'main_table' ? 'Main' : 'AS400'}
                      </span>
                    </div>
                    {dup.reason && (
                      <div className="text-xs text-gray-500 ml-3 max-w-xs">
                        <span className="bg-gray-50 px-2 py-1 rounded border">
                          {dup.reason}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">ข้อมูลที่ซ้ำจะไม่ถูกนำเข้าระบบ</p>
                <p className="text-xs text-blue-700">
                  • ตาราง Main: เป็นข้อมูลที่ประมวลผลและโอนไปยัง AS400 แล้ว<br/>
                  • ระบบ AS400: เป็นข้อมูลที่มีอยู่ในระบบ AS400 อยู่แล้ว (ตัด Order No ให้เหลือ 15 หลัก)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function UploadPage() {
  const [user, setUser] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fileHasChanged, setFileHasChanged] = useState(false)
  const [isUploadSectionCollapsed, setIsUploadSectionCollapsed] = useState(false)
  
  // ✅ เพิ่ม Store Selection State
  const [selectedStore, setSelectedStore] = useState('')
  
const [modalContent, setModalContent] = useState({
  title: '',
  type: 'success',
  items: [],
  // debugInfo และ duplicateInfo ไม่จำเป็นต้องใส่ที่นี่จนกว่าจะใช้งานจริง
})


  const [toast, setToast] = useState({
    show: '',
    message: '',
    type: 'success'
  })

  const fileInputRef = useRef(null)
  const router = useRouter()

  // ✅ ตัวเลือกร้านค้า
  const storeOptions = [
    {
      value: 'WAIWAI',
      label: 'ร้านค้าไวไว',
      opcus: '988899',
      description: 'ร้านค้าไวไว - 988899',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: <Store className="w-5 h-5" />
    },
    {
      value: 'SERDA',
      label: 'ร้านค้าซือดะ',
      opcus: '989902',
      description: 'ร้านค้าซือดะ - 989902',
      color: 'bg-green-500 hover:bg-green-600',
      icon: <Building2 className="w-5 h-5" />
    }
  ]

  useEffect(() => {
    // const checkAuth = () => {
    //   try {
    //     const token = localStorage.getItem('token')
    //     const userData = localStorage.getItem('user')
        
    //     if (!token || !userData) {
    //       console.log('🔒 No authentication found, redirecting to login')
    //       router.push('/login')
    //       return
    //     }

    //     const user = JSON.parse(userData)
    //     setUser(user)
    //     console.log('✅ User authenticated:', user.username)
    //   } catch (error) {
    //     console.error('❌ Auth check failed:', error)
    //     router.push('/login')
    //   }
    // }

    // checkAuth()
  }, [router])

  const showToast = (message, type) => {
    console.log(`📢 Toast: ${type.toUpperCase()} - ${message}`)
    setToast({ show: true, message, type })
  }

  const handleFileSelect = (file) => {
    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    })
    
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!allowedTypes.includes(file.type)) {
      console.warn('⚠️ Invalid file type:', file.type)
      showToast('รองรับเฉพาะไฟล์ .xlsx และ .xls เท่านั้น', 'error')
      return
    }
    
    // ตรวจสอบขนาดไฟล์ (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.warn('⚠️ File too large:', file.size)
      showToast('ขนาดไฟล์ต้องไม่เกิน 10MB', 'error')
      return
    }
    
    setSelectedFile(file)
    setUploadResult(null)
    setFileHasChanged(true)
    setIsUploadSectionCollapsed(false)
    console.log('✅ File validation passed, upload button enabled')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {

    
    if (!selectedFile) {
      showToast('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด', 'warning')
      return
    }

    // ✅ ตรวจสอบการเลือกร้านค้า
    if (!selectedStore) {
      showToast('กรุณาเลือกร้านค้าก่อนอัพโหลด', 'warning')
      return
    }

    if (!fileHasChanged && uploadResult) {
      showToast('กรุณาเลือกไฟล์ใหม่ก่อนอัพโหลดอีกครั้ง', 'warning')
      return
    }

    //setUploading(true)
    console.log('🚀 Starting file upload:', {
      fileName: selectedFile.name,
      selectedStore,
      opcus: storeOptions.find(s => s.value === selectedStore)?.opcus
    })
   

    console.log(selectedFile);

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      
      // ✅ เพิ่มข้อมูลร้านค้า
      formData.append('storeType', selectedStore)
      formData.append('opcus', storeOptions.find(s => s.value === selectedStore)?.opcus || '')

      // const token = localStorage.getItem('token')
      console.log('📤 Sending upload request with store info...')
      
      const response = await fetch('api/upload/import', {
        method: 'POST',
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // },
        body: formData
      })

      const result = await response.json()
      console.log(result,"<-----result");
      // console.log('📥 Upload response received:', {
      //   status: response.status
      //   // ,
      //   // success: result.success,
      //   // batchId: result.data?.batchId,
      //   // message: result.message,
      //   // duplicateInfo: result.data?.duplicateInfo,
      //   // debug: result.data?.debug || result.debug
      // })
      

      return false;
      // setUploadResult(result)
      // setFileHasChanged(false)
      
      // if (result.success && result.data) {
      //   console.log('🎉 Upload successful:', {
      //     batchId: result.data.batchId,
      //     fileName: result.data.fileName,
      //     records: result.data.summary,
      //     duplicates: result.data.duplicateInfo,
      //     tempTableRecords: result.data.debug?.tempTableRecords,
      //     storeType: selectedStore
      //   })
        
      //   setTimeout(() => {
      //     setIsUploadSectionCollapsed(true)
      //   }, 1000)
        
      //   if (result.data.duplicateInfo.hasDuplicates) {
      //     showToast(
      //       `${result.message} - พบข้อมูลซ้ำ ${result.data.duplicateInfo.duplicateCount} รายการ`, 
      //       'warning'
      //     )
      //   } else {
      //     showToast(result.message || 'อัพโหลดไฟล์สำเร็จ', 'success')
      //   }
        
      //   if (result.data.debug) {
      //     console.log('🐛 Debug information:', result.data.debug)
      //   }
        
      //   if (result.data.warnings && result.data.warnings.length > 0) {
      //     const batchData = result.data
      //     setTimeout(() => {
      //       setModalContent({
      //         title: 'คำเตือน',
      //         type: 'warnings',
      //         items: batchData.warnings
      //       })
      //       setShowModal(true)
      //     }, 2000)
      //   }
      // } else {
      //   console.error('❌ Upload failed:', {
      //     message: result.message,
      //     errors: result.details?.errors,
      //     duplicates: result.details?.duplicateDetails,
      //     debug: result.debug
      //   })
        
      //   if (result.details?.summary && result.details.summary.duplicateRecords > 0) {
      //     showToast(
      //       `${result.message} (Main: ${result.details.summary.duplicateInMain}, AS400: ${result.details.summary.duplicateInAS400})`, 
      //       'warning'
      //     )
      //   } else {
      //     showToast(result.message || 'เกิดข้อผิดพลาดในการอัพโหลด', 'error')
      //   }
        
      //   if (result.details?.errors && result.details.errors.length > 0) {
      //     setModalContent({
      //       title: 'รายละเอียดข้อผิดพลาด',
      //       type: 'errors',
      //       items: result.details.errors
      //     })
      //     setShowModal(true)
      //   }
      // }
    } catch (error) {
      console.error('❌ Upload error:', error)
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleViewPreview = () => {
    if (uploadResult?.data?.batchId) {
      console.log('👀 Navigating to preview:', uploadResult.data.batchId)
      router.push(`/preview/${uploadResult.data.batchId}`)
    }
  }

  const handleViewDuplicates = () => {
    if (uploadResult?.data?.duplicateInfo) {
      setModalContent({
        title: 'รายละเอียดข้อมูลซ้ำ',
        type: 'duplicates',
        items: [],
        duplicateInfo: uploadResult.data.duplicateInfo
      })
      setShowModal(true)
    }
  }

  const resetUpload = () => {
    console.log('🔄 Resetting upload form')
    setSelectedFile(null)
    setUploadResult(null)
    setFileHasChanged(true)
    setIsUploadSectionCollapsed(false)
    setSelectedStore('') // ✅ รีเซ็ตตัวเลือกร้านค้าด้วย
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleUploadSection = () => {
    setIsUploadSectionCollapsed(!isUploadSectionCollapsed)
  }

  // if (!user) {
  //   return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
  //     <div className="text-center">
  //       <div className="spinner w-8 h-8 mx-auto mb-4"></div>
  //       <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
  //     </div>
  //   </div>
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <AnimatePresence>
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
      </AnimatePresence>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={modalContent.title}
      >
        <div className="space-y-4">
          {modalContent.type === 'duplicates' && modalContent.duplicateInfo ? (
            <DuplicateInfoCard duplicateInfo={modalContent.duplicateInfo} />
          ) : (
            modalContent.items.map((item, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  modalContent.type === 'errors' 
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : modalContent.type === 'warnings'
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                    : modalContent.type === 'debug'
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-green-50 border-green-400 text-green-700'
                }`}
              >
                <code className="text-sm font-mono">{item}</code>
              </div>
            ))
          )}
          
          {modalContent.debugInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Debug Information:</h4>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(modalContent.debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 flex items-center space-x-2 disabled:opacity-50 py-3 px-4 border rounded-lg mr-4 shadow-lg" 
            >
              <ArrowLeft className="w-4 h-4 text-black" />
              <span className="text-black">กลับ</span>
            </button>
            <div>
              <h1 className="text-xl font-bold gradient-text">อัพโหลดไฟล์ข้อมูล</h1>
              <p className="text-sm text-gray-900">อัพโหลดไฟล์ Excel ข้อมูลการชำระเงินจาก MakroPro (พร้อมตรวจสอบข้อมูลซ้ำ)</p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Upload Section with Store Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 mb-8 bg-white px-6 shadow-xl rounded-lg"
        >
          <div 
            className="border-b-2 cursor-pointer transition-colors duration-200"
            onClick={toggleUploadSection}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">เลือกไฟล์สำหรับอัพโหลด</h2>
                <p className="text-sm text-gray-600 mt-1">
                  รองรับไฟล์ .xlsx และ .xls ขนาดไม่เกิน 10MB (ระบบจะตรวจสอบข้อมูลซ้ำอัตโนมัติ)
                </p>
              </div>
              <motion.div
                animate={{ rotate: isUploadSectionCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </div>
          </div>
          
          <AnimatePresence>
            {!isUploadSectionCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-6 mt-6">
                  {/* ✅ Store Selection Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Store className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">เลือกร้านค้า</h3>
                      <span className="text-red-500">*</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {storeOptions.map((store) => (
                        <motion.div
                          key={store.value}
                          whileTap={{ scale: 0.98 }}
                        >
                          <label className="cursor-pointer">
                            <input
                              type="radio"
                              name="store"
                              value={store.value}
                              checked={selectedStore === store.value}
                              onChange={(e) => {
                                setSelectedStore(e.target.value)
                                console.log('🏪 Store selected:', {
                                  store: e.target.value,
                                  opcus: store.opcus
                                })
                              }}
                              className="sr-only"
                            />
                            <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              selectedStore === store.value
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}>
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  selectedStore === store.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {store.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-semibold ${
                                    selectedStore === store.value ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {store.label}
                                  </h4>
                                  <p className={`text-sm ${
                                    selectedStore === store.value ? 'text-blue-700' : 'text-gray-600'
                                  }`}>
                                    {store.description}
                                  </p>
                                </div>
                                {selectedStore === store.value && (
                                  <CheckCircle className="w-6 h-6 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </label>
                        </motion.div>
                      ))}
                    </div>
                    
                    {!selectedStore && (
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-medium">กรุณาเลือกร้านค้าก่อนอัพโหลดไฟล์</span>
                      </div>
                    )}
                  </div>

                  {/* File Selection Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">เลือกไฟล์ Excel</h3>
                      <span className="text-red-500">*</span>
                    </div>

                    {!selectedFile ? (
                      <div
                        className={`text-center rounded-lg px-8 py-8 border-2 border-dashed file-upload-zone ${dragOver ? 'dragover' : ''} ${!selectedStore ? 'opacity-50 pointer-events-none' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => selectedStore && fileInputRef.current?.click()}
                      >
                        <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                        </h3>
                        <p className="text-gray-500">
                          รองรับไฟล์ .xlsx และ .xls ขนาดไม่เกิน 10MB
                        </p>
                        {!selectedStore && (
                          <p className="text-amber-600 text-sm mt-2 font-medium">
                            เลือกร้านค้าก่อนเลือกไฟล์
                          </p>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileInputChange}
                          className="hidden"
                          disabled={!selectedStore}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* File Info */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                              <p className="text-sm text-gray-600">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={resetUpload}
                            className="text-red-600 hover:text-red-700"
                            disabled={uploading}
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Selected Store Info */}
                        {selectedStore && (
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              {storeOptions.find(s => s.value === selectedStore)?.icon}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {storeOptions.find(s => s.value === selectedStore)?.label}
                                </p>
                                <p className="text-sm text-gray-600">
                                  OPCUS: {storeOptions.find(s => s.value === selectedStore)?.opcus}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex space-x-4">
                          <button
                            onClick={handleUpload}
                            disabled={uploading || (!fileHasChanged && !!uploadResult) || !selectedStore}
                            className={`bg-blue-500 rounded-lg py-2 flex-1 flex items-center justify-center transition-all duration-200 ${
                              (!fileHasChanged && !!uploadResult) || !selectedStore
                                ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                                : 'disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {uploading ? (
                              <>
                                <div className="spinner w-5 h-5 mr-2"></div>
                                กำลังอัพโหลดและตรวจสอบข้อมูลซ้ำ...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 mr-2" />
                                {(!fileHasChanged && !!uploadResult) 
                                  ? 'เลือกไฟล์ใหม่เพื่ออัพโหลด' 
                                  : 'อัพโหลดไฟล์ (พร้อมตรวจสอบซ้ำ)'
                                }
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || !selectedStore}
                            className="text-white bg-gray-400 py-2 px-2 rounded-lg"
                          >
                            เปลี่ยนไฟล์
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upload Result */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="card-header">
              <div className="flex items-center space-x-2">
                {uploadResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  ผลการอัพโหลด
                </h3>
              </div>
            </div>
            <div className="card-body">
              <div className={`alert ${uploadResult.success ? 'alert-success' : 'alert-error'} mb-6`}>
                <p className="font-medium">{uploadResult.message}</p>
              </div>

              {/* Store Info in Result */}
              {selectedStore && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl mb-6 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    {storeOptions.find(s => s.value === selectedStore)?.icon}
                    <div>
                      <p className="font-semibold text-gray-900">
                        ร้านค้าที่เลือก: {storeOptions.find(s => s.value === selectedStore)?.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        OPCUS: <span className="font-mono bg-white px-2 py-1 rounded border">
                          {storeOptions.find(s => s.value === selectedStore)?.opcus}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate Info Card */}
              {uploadResult.success && uploadResult.data?.duplicateInfo && (
                <DuplicateInfoCard duplicateInfo={uploadResult.data.duplicateInfo} />
              )}

              {/* Error case duplicate info */}
              {!uploadResult.success && uploadResult.details?.summary && uploadResult.details.summary.duplicateRecords > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
                >
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-2">ข้อมูลซ้ำทั้งหมด</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{uploadResult.details.summary.duplicateRecords}</p>
                          <p className="text-sm text-red-700">รวมทั้งหมด</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{uploadResult.details.summary.duplicateInMain}</p>
                          <p className="text-sm text-blue-700">ตาราง Main</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{uploadResult.details.summary.duplicateInAS400}</p>
                          <p className="text-sm text-orange-700">ระบบ AS400</p>
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mb-4">
                        ไม่สามารถนำเข้าข้อมูลได้เนื่องจากข้อมูลทั้งหมดซ้ำกับข้อมูลที่มีอยู่แล้ว
                      </p>
                      
                      {uploadResult.details?.duplicateDetails && uploadResult.details.duplicateDetails.length > 0 && (
                        <button
                          onClick={() => {
                            const errorDuplicateInfo = {
                              hasDuplicates: true,
                              duplicateCount: uploadResult.details.summary.duplicateRecords,
                              duplicateInMain: uploadResult.details.summary.duplicateInMain,
                              duplicateInAS400: uploadResult.details.summary.duplicateInAS400,
                              duplicateDetails: uploadResult.details.duplicateDetails
                            }
                            
                            setModalContent({
                              title: 'รายละเอียดข้อมูลซ้ำ (Error Case)',
                              type: 'duplicates',
                              items: [],
                              duplicateInfo: errorDuplicateInfo
                            })
                            setShowModal(true)
                          }}
                          className="btn-warning flex items-center space-x-2 w-full"
                        >
                          <AlertTriangle className="w-5 h-5" />
                          <span>ดูรายละเอียดข้อมูลซ้ำ ({uploadResult.details.summary.duplicateRecords} รายการ)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Success Actions */}
              {uploadResult.success && uploadResult.data && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">ขั้นตอนต่อไป</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleViewPreview}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>ดูข้อมูลและโอนเข้า AS400</span>
                    </button>
                    
                    {uploadResult.data.duplicateInfo.hasDuplicates && (
                      <button
                        onClick={handleViewDuplicates}
                        className="btn-warning flex items-center space-x-2"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        <span>ดูข้อมูลซ้ำ ({uploadResult.data.duplicateInfo.duplicateCount})</span>
                      </button>
                    )}
                    
                    <button
                      onClick={resetUpload}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>อัพโหลดไฟล์ใหม่</span>
                    </button>
                  </div>
                </div>
              )}

              {!uploadResult.success && uploadResult.debug && (
                <div className="bg-red-50 p-4 rounded-xl mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Server className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900">Debug Information</h4>
                  </div>
                  <div className="text-sm text-red-700 space-y-1">
                    {uploadResult.debug.batchId && (
                      <div>Batch ID: <code className="font-mono">{uploadResult.debug.batchId}</code></div>
                    )}
                    {uploadResult.debug.errorType && (
                      <div>Error Type: <code className="font-mono">{uploadResult.debug.errorType}</code></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Instructions 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">คำแนะนำการใช้งาน</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">ขั้นตอนการอัพโหลด:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">1.</span>
                    <span>เลือกร้านค้า (ไวไว หรือ ซือดะ)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">2.</span>
                    <span>เลือกไฟล์ Excel ข้อมูลจาก Lazada</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">3.</span>
                    <span>กดปุ่ม "อัพโหลดไฟล์"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">4.</span>
                    <span>ตรวจสอบข้อมูลใน "ดูข้อมูลและโอนเข้า AS400"</span>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">รูปแบบไฟล์ที่รองรับ:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>ไฟล์ Excel (.xlsx, .xls)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>ขนาดไฟล์ไม่เกิน 10MB</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>ข้อมูลการชำระเงินจาก Lazada</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-800">ข้อมูลร้านค้า:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Store className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">ร้านค้าไวไว</p>
                    <p className="text-sm text-blue-700">OPCUS: 988899</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">ร้านค้าซือดะ</p>
                    <p className="text-sm text-green-700">OPCUS: 989902</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 font-medium">การตรวจสอบข้อมูลซ้ำ</p>
                  <p className="text-xs text-blue-700 mt-1">
                    ระบบจะตรวจสอบ Order No ที่ซ้ำกันทั้งในตาราง Main (ข้อมูลที่ประมวลผลแล้ว) 
                    และระบบ AS400 (ข้อมูลที่โอนแล้ว) เพื่อป้องกันการนำเข้าข้อมูลซ้ำ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>*/}

        {/* Supported Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 mb-8 bg-white px-6  shadow-xl rounded-lg"
        >
          <div className="border-b-2 px-6 py-2">
            <h3 className="text-lg font-semibold text-gray-900">คอลัมน์ที่ต้องมีในไฟล์</h3>
          </div>

            <div className="overflow-x-auto sm:rounded-lg mt-5">
              <table className="w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-gray-600 px-4 py-2 border-b-2 text-md text-left">ชื่อคอลัมน์</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ความจำเป็น</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">รูปแบบ</th>
                    <th className="text-gray-600 px-4 py-2 text-center border-b-2 text-md">ตัวอย่าง</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-gray-700 px-4 py-2 border-b-2 font-medium">Transaction Date</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-red-700 bg-red-100">จำเป็น</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">วัน-เดือน-ปี</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">01-Jun-2025</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 px-4 py-2 border-b-2 font-medium">Fee Name</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-red-700 bg-red-100">จำเป็น</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">ข้อความ</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">Item Price Credit</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 px-4 py-2 border-b-2 font-medium">Order No.</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-red-700  bg-red-100">จำเป็น</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">ตัวเลข</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">1012880958060138</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 font-medium px-4 py-2 border-b-2">Amount</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-red-700  bg-red-100">จำเป็น</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">ตัวเลข (บวก/ลบ)</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">150.00, -25.50</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 px-4 py-2 border-b-2 font-medium">Order Item No.</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-yellow-800  bg-yellow-100">แนะนำ</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">ตัวเลข</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">1012880958160138</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 px-4 py-2 border-b-2 font-medium">Details</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-blue-800  bg-blue-100">ทางเลือก</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">ข้อความ</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">รายละเอียดสินค้า</td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 px-4 py-2 border-b-2 font-medium">Seller SKU</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2"><span className="px-3 py-1 rounded-xl text-sm text-blue-800  bg-blue-100">ทางเลือก</span></td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">ข้อความ</td>
                    <td className="text-gray-700 px-4 py-2 text-center border-b-2">SKU123456</td>
                  </tr>
                </tbody>
              </table>
          </div>

        </motion.div>

        {/* Fee Name Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 mb-8 bg-white px-6  shadow-xl rounded-lg"
        >
          <div className="border-b-2 px-2 py-2">
            <h3 className="text-lg font-semibold text-gray-900">ประเภท Fee Name ที่รองรับ</h3>
          </div>
          <div className="card-body mt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="font-medium text-green-800">Item Price Credit</p>
                  <p className="text-sm text-green-600">รายได้จากการขายสินค้า</p>
                </div>
                
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <p className="font-medium text-red-800">Payment Fee</p>
                  <p className="text-sm text-red-600">ค่าธุรกรรมการชำระเงิน</p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <p className="font-medium text-orange-800">Commission</p>
                  <p className="text-sm text-orange-600">ค่าคอมมิชชั่น Lazada</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="font-medium text-blue-800">Payment fee - correction</p>
                  <p className="text-sm text-blue-600">ปรับปรุงค่าธุรกรรม</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <p className="font-medium text-purple-800">Commission fee - correction</p>
                  <p className="text-sm text-purple-600">ปรับปรุงค่าคอมมิชชั่น</p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="font-medium text-yellow-800">Lost Claim</p>
                  <p className="text-sm text-yellow-600">ค่าชดเชยสินค้าสูญหาย</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}