// app/upload/page.tsx - Enhanced with Store Selection
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle,
  X,
  Database,
  Server,
  AlertTriangle,
  Info,
  XCircle,
  ChevronDown,
  ChevronUp,
  Store,
  Building2,
  CircleDollarSign,
  CornerDownLeft,
  CircleCheckBig,
  Send,
  ShoppingCart,
  ListCheck,
  HandCoins,
  LogOut
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
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fileHasChanged, setFileHasChanged] = useState(false);
  const [isUploadSectionCollapsed, setIsUploadSectionCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  // ✅ เพิ่ม Store Selection State
  const [selectedStore, setSelectedStore] = useState('');
  const [dataShow, setDataShow] = useState({});
  const [dataShowInTable, setDataShowInTable] = useState([]);
  const [dataDuplicateShowInTable, setDuplicateShowInTable] = useState([]);
  const [showDataTotal, setshowDataTotal] = useState(true);
  const [showDataAfterTranfersAs400, setshowDataAfterTranfersAs400] = useState(true);
  const [showBtnExport, setshowBtnExport] = useState(true);
  const [dataExport, setDataExport] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: '',
    type: 'success',
    items: [],
  });


  const [toast, setToast] = useState({
    show: '',
    message: '',
    type: 'success'
  });

  const fileInputRef = useRef(null);
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const fullName = localStorage.getItem('fullName')
        if (!token || !fullName) {
          //console.log('🔒 No authentication found, redirecting to login')
          router.push('/')
          return
        }

        setName(fullName)
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        router.push('/')
      }
    }

    checkAuth()
  }, [])

  const showToast = (message, type) => {
    console.log(`📢 Toast: ${type.toUpperCase()} - ${message}`)
    setToast({ show: true, message, type })
  }

  const tranfersAs400 = async () => {
    //console.log("TEST");
      try {
      const formData = new FormData()
      
      formData.append('data', JSON.stringify(dataShowInTable))

      const token = localStorage.getItem('token')
      
      const response = await fetch('api/upload/transfers400', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      

      const result = await response.json()
      if(result.success == true){
        showToast('อัพโหลดข้อมูลเข้าAS400สำเร็จ', 'success');
        //console.log(result);

        setDuplicateShowInTable(result.data);

        setDataExport(result.data);

        if(result.data.length > 0){
          setshowBtnExport(false);
          //console.log("เข้าSet Show Btn Export");
        }
      }

      

    } catch (error) {
      console.error('❌ Upload error:', error);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setshowDataAfterTranfersAs400(false);
    }


  }

  const exportExcel = async () => {
    try {
      console.log("เข้าแล้ว");
      const formData = new FormData();
      formData.append('data',JSON.stringify(dataExport));
      console.log("1");
      const response = await fetch('api/upload/exportData', {
        method: 'POST',
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // },
        body: formData
      })

      const result = await response.blob();
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export_data.xlsx';
      a.click();
      
    } catch(err){
      console.error('❌ Upload error:', err);
    }
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
    //console.log('✅ File validation passed, upload button enabled')
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

    if (!fileHasChanged && uploadResult) {
      showToast('กรุณาเลือกไฟล์ใหม่ก่อนอัพโหลดอีกครั้ง', 'warning')
      return
    }

    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2); // number
    const maxSizeFile = 10;
  
    if(fileSizeMB > maxSizeFile){
      showToast('ไม่สามารถอัพโหลดได้เนื่องจากไฟล์ที่อัพโหลดมีขนาดเกิน 10 MB', 'warning')
      return false;
    }

    //console.log(selectedFile);

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const token = localStorage.getItem('token')
      const response = await fetch('api/upload/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if(result.success == true){
        showToast('อัพโหลดไฟล์สำเร็จ', 'success');
        setDataShow(result.dataafterimport[0]);
        setDataShowInTable(result.dataShowTable);
      }else{
        showToast('อัพโหลดข้อมูลไม่สำเร็จเนื่องจากข้อมูลผู้ใช้งานไม่ถูกต้อง หรือ Token หมดอายุ', 'warning');
      }

    } catch (error) {
      console.error('❌ Upload error:', error)
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error')
    } finally {
      setUploading(false)
      setLoading(false)
      setshowDataTotal(false)
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
          <div className="flex items-center py-4 justify-between">
            <div>
              <h1 className="text-xl font-bold gradient-text">อัพโหลดไฟล์ข้อมูล</h1>
              <p className="text-sm text-gray-900">อัพโหลดไฟล์ Excel ข้อมูลการชำระเงินจาก MakroPro</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 flex items-center space-x-2 disabled:opacity-50 py-3 px-4 border rounded-lg mr-4 shadow-lg" 
            >
              <span className="text-black">ออกจากระบบ</span>
              <LogOut className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
        
      </motion.header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 mb-8 bg-white px-6 shadow-xl rounded-lg"
        >
          <div 
            className="border-b-2 transition-colors duration-200"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">เลือกไฟล์สำหรับอัพโหลด</h2>
                <p className="text-sm text-gray-600 mt-1">
                  รองรับไฟล์ .xlsx และ .xls ขนาดไม่เกิน 10MB
                </p>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 mt-6">
              

                {/* File Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">เลือกไฟล์ Excel</h3>
                    <span className="text-red-500">*</span>
                  </div>

                  {!selectedFile ? (
                    <div
                      className={`text-center rounded-lg px-8 py-8 border-2 border-dashed file-upload-zone ${dragOver ? 'dragover' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                      </h3>
                      <p className="text-gray-500">
                        รองรับไฟล์ .xlsx และ .xls ขนาดไม่เกิน 10MB
                      </p>
                
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileInputChange}
                        className="hidden"
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
                          disabled={uploading || (!fileHasChanged && !!uploadResult)}
                          className={`bg-blue-500 rounded-lg py-2 flex-1 flex items-center justify-center transition-all duration-200 ${
                            (!fileHasChanged && !!uploadResult)
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
                                : 'อัพโหลดไฟล์'
                              }
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
              



        { !showDataTotal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 mb-6 bg-white px-6 shadow-lg rounded-lg"
          >
            <div 
              className="transition-colors duration-200"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <span className='gap-2 inline-flex'>
                    <ListCheck className='text-black'/>
                    <h2 className="text-lg font-semibold text-gray-900">ตรวจสอบข้อมูลก่อนการโอนข้อมูลเข้า AS400</h2>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          )
        }

        { !showDataTotal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              <div className="border-2 border-blue-500 border-solid rounded-lg bg-white card-body shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-1">Item Price Credit</p>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="spinner w-5 h-5"></div>
                        <span className="text-gray-400">กำลังโหลด...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-md font-bold text-blue-500 group-hover:scale-105 transition-transform">
                          $ {typeof dataShow.SubTotal === "number" ? dataShow.SubTotal.toLocaleString() : dataShow.SubTotal}
                        </p>
                        <p className="text-md text-gray-500 mt-1">บาท</p>
                      </>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl group-hover:scale-110 bg-blue-500 transition-transform`}
                  >
                    <HandCoins className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="border-2 border-red-500 border-solid rounded-lg bg-white card-body shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-1">ยอดเงินที่คืนแล้ว</p>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="spinner w-5 h-5"></div>
                        <span className="text-gray-400">กำลังโหลด...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-md font-bold text-red-500 group-hover:scale-105 transition-transform">
                          { 
                            dataShow.statusOrderRefund > 0 ? 
                              (typeof dataShow.statusOrderRefund === "number" ? dataShow.statusOrderRefund.toLocaleString() : dataShow.statusOrderRefund)
                            : "-" 
                          }

                        </p>
                        <p className="text-md text-gray-500 mt-1">บาท</p>
                      </>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl group-hover:scale-110 bg-red-500 transition-transform`}
                  >
                    <CornerDownLeft className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="border-2 border-green-500 border-solid rounded-lg bg-white card-body shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-1">ยอดเงินที่ปิดแล้ว</p>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="spinner w-5 h-5"></div>
                        <span className="text-gray-400">กำลังโหลด...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-md font-bold text-green-500 group-hover:scale-105 transition-transform">
                          $ {typeof dataShow.statusOrderClose === "number" ? dataShow.statusOrderClose.toLocaleString() : dataShow.statusOrderClose}
                        </p>
                        <p className="text-md text-gray-500 mt-1">บาท</p>
                      </>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl group-hover:scale-110 bg-green-500 transition-transform`}
                  >
                    <CircleCheckBig className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="border-2 border-purple-500 border-solid rounded-lg bg-white card-body shadow-xl hover:-translate-y-2 card-body text-center  px-3 py-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rounded-lg hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-1">ยอดเงินรวม</p>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="spinner w-5 h-5"></div>
                        <span className="text-gray-400">กำลังโหลด...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-md font-bold text-purple-500 group-hover:scale-105 transition-transform">
                          $ {typeof dataShow.Total === "number" ? dataShow.Total.toLocaleString() : dataShow.Total }
                        </p>
                        <p className="text-md text-gray-500 mt-1">บาท</p>
                      </>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl group-hover:scale-110 bg-purple-500 transition-transform`}
                  >
                    <CircleDollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
          )
        }
          
        { !showDataTotal && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-lg mb-8"
          >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <ShoppingCart className="mr-2" size={24} />
                  รายละเอียดรายการสินค้า ( รายการ)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  แสดงข้อมูลแยกตามรายการสินค้า (Order Item) แต่ละตัว               
                </p>
              </div>

              <div className="overflow-x-auto rounded-sm max-h-[600px]">
                <table className="rounded-md w-full border border-gray-200 border-collapse shadow-lg overflow-hidden table-auto">
                  <thead className="bg-blue-600 text-white sticky top-0 z-10">
                    <tr className="text-center">
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[60px]">ลำดับ</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[150px]">Order No.</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[100px]">รหัส</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[100px]">ค่าคอม</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[120px]">Vat ค่าคอม</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[150px]">ยอดในบิล</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[130px]">วันที่โอน</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[200px]">คำสั่งซื้อที่คืนเงินให้ลูกค้า</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[180px]">ค่าคอม คำสั่งซื้อที่คืนเงิน</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[160px]">ค่าคอม + Vat ค่าคอม</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[130px]">วันที่โอน</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[100px]">เวลาที่โอน</th>
                      <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[160px]">ยอดเงินที่ได้รับจริง</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(dataShowInTable || []).map((item, index) => (
                      <tr
                        key={item.Oseq}
                        className="text-center text-xs even:bg-gray-50 odd:bg-white hover:bg-blue-50 transition-colors duration-200 text-black"
                      >
                        <td className="px-3 py-2 border-b border-gray-200">{index + 1}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{item.opbil}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.opcus}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.ocom1}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.ocom2}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.obamt}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.opmdt}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.ortna}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.oscam}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.otamt}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.otdte}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.otime}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{item.otram}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        </motion.div>
          )
        }

        {!showDataTotal && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            data-testid="transfer-section"  // ✅ เพิ่ม testid
            className="mb-8"
          >
            <div className="bg-white shadow-xl p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Send className="text-blue-600" size={24} />
                <span>โอนข้อมูลเข้า AS400</span>
              </h2>
              
              <div className="space-y-4">
                {/* Store Type Display - แสดงข้อมูลร้านค้าที่เลือกไว้แล้ว */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="text-gray-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">ร้านค้าที่เลือก</p>
                        <p className="font-semibold text-gray-800">
                          MakroPro (989905)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">จำนวนรายการ</p>
                      <p className="font-semibold text-green-600">{dataShowInTable.length}</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Button */}
                <div className="flex justify-end">
                  <button
                    onClick={tranfersAs400}
                  
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded-lg"
                    data-testid="transfer-button"  // ✅ เพิ่ม testid
                  >
                    <span className='inline-flex items-center gap-2'>
                      <Send size={20} />
                      ยืนยันการโอนข้อมูล
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

          { !showDataAfterTranfersAs400 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-lg mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <ShoppingCart className="mr-2" size={24} />
                รายละเอียดรายการสินค้า ที่มีซ้ำ ใน AS400
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                แสดงข้อมูลแยกตามรายการสินค้า (Order Item) แต่ละตัว               
              </p>
            </div>

            <div className="overflow-x-auto rounded-sm max-h-[600px]">
              <table className="rounded-md w-full border border-gray-200 border-collapse shadow-lg overflow-hidden table-auto">
                <thead className="bg-blue-600 text-white sticky top-0 z-10">
                  <tr className="text-center">
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[60px]">ลำดับ</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[150px]">Order No.</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[100px]">รหัส</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[100px]">ค่าคอม</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[120px]">Vat ค่าคอม</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[150px]">ยอดในบิล</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[130px]">วันที่โอน</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[200px]">คำสั่งซื้อที่คืนเงินให้ลูกค้า</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[180px]">ค่าคอม คำสั่งซื้อที่คืนเงิน</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[160px]">ค่าคอม + Vat ค่าคอม</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[130px]">วันที่โอน</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[100px]">เวลาที่โอน</th>
                    <th className="px-4 py-3 font-semibold border-b border-gray-300 text-sm min-w-[160px]">ยอดเงินที่ได้รับจริง</th>
                  </tr>
                </thead>

                <tbody>
                  {dataDuplicateShowInTable.length > 0 ? (
                    dataDuplicateShowInTable.map((item, index) => (
                    <tr
                      key={item.Oseq}
                      className="text-center text-xs even:bg-gray-50 odd:bg-white hover:bg-blue-50 transition-colors duration-200 text-red-500"
                    >
                      <td className="px-3 py-2 border-b border-gray-200">{index + 1}</td>
                      <td className="px-4 py-2 border-b border-gray-200">{item.opbil}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.opcus}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.ocom1}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.ocom2}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.obamt}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.opmdt}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.ortna}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.oscam}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.otamt}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.otdte}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.otime}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{item.otram}</td>
                    </tr>
                    ))) : (
                      <tr className="text-center text-xs even:bg-gray-50 odd:bg-white hover:bg-blue-50 transition-colors duration-200 text-red-500">
                        <td colSpan={13} className="py-2">
                          ไม่มีข้อมูลซ้ำ
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>

            { !showBtnExport && (
              <div className="flex justify-end mt-5">
                <button
                  onClick={exportExcel}
                
                  className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-green-900 text-white font-medium py-2 px-4 rounded-lg"
                  data-testid="transfer-button"
                >
                  <span className='inline-flex items-center gap-2'>
                    <FileSpreadsheet size={20} />
                    Export File
                  </span>
                </button>
              </div>
            )}
            

          </motion.div>
          )
        }

      </div>
    </div>
  )
}