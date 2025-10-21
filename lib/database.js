// lib/database.ts - Updated duplicate checking with orderNo + opcus + transactionDate
import { PrismaClient } from '@prisma/client'

// Prisma instance
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// ✅ อัปเดต - Interface สำหรับผลการตรวจสอบข้อมูลซ้ำ
// interface DuplicateCheckResult {
//   isDuplicate: boolean
//   location: 'main_table' | 'as400' | null
//   reason: string | null
//   existingRecord: any
//   details: any
// }

// Logging functions
export const logInfo = (message, data) => {
  const timestamp = new Date().toISOString()
  console.log(`[INFO] ${timestamp} - ${message}`, data || '')
}

export const logError = (message, error) => {
  const timestamp = new Date().toISOString()
  console.error(`[ERROR] ${timestamp} - ${message}`, error || '')
}

export const logWarn = (message, data) => {
  const timestamp = new Date().toISOString()
  console.warn(`[WARN] ${timestamp} - ${message}`, data || '')
}

/**
 * ✅ อัปเดต - ตรวจสอบข้อมูลซ้ำใน Main Table ด้วย orderNo + opcus + transactionDate
 * เปลี่ยนจากเช็คเฉพาะ orderNo เป็นเช็ค 3 ฟิลด์รวมกัน
 */
export const checkDuplicateInMainTable = async (
  orderNo,
  opcus,          // 🆕 เพิ่ม opcus parameter
  transactionDate,  // 🆕 เพิ่ม transactionDate parameter (required)
  orderItemNo
) => {
  try {
    logInfo('🔍 Checking duplicate in main table with 3-field validation', { 
      orderNo: orderNo,
      opcus: opcus,
      transactionDate: transactionDate.toISOString().split('T')[0],
      orderItemNo
    })
    
    // ✅ อัปเดต where condition - เช็ค 3 ฟิลด์รวมกัน
    const whereCondition = {
      orderNo: orderNo,
      opcus: opcus        // 🆕 เพิ่มการเช็ค opcus
    }
    
    // เพิ่ม orderItemNo ถ้ามี
    if (orderItemNo) {
      whereCondition.orderItemNo = orderItemNo
    }
    
    // ✅ เช็ควันที่แบบ range เพื่อให้แน่ใจ
    const startOfDay = new Date(transactionDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(transactionDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    whereCondition.transactionDate = {
      gte: startOfDay,
      lte: endOfDay
    }
    
    logInfo('🔍 Main table search criteria', {
      orderNo: whereCondition.orderNo,
      opcus: whereCondition.opcus,
      orderItemNo: whereCondition.orderItemNo,
      dateRange: {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      }
    })
    
    const existingRecord = await prisma.lazadaPaymentMain.findFirst({
      where: whereCondition,
      select: {
        id: true,
        orderNo: true,
        orderItemNo: true,
        opcus: true,
        transactionDate: true,
        storeType: true,
        totalAmount: true,
        as400SentAt: true
      }
    })
    
    const isDuplicate = !!existingRecord
    
    if (isDuplicate) {
      logWarn('⚠️ Duplicate found in main table with 3-field check', { 
        searchCriteria: {
          orderNo: orderNo,
          opcus: opcus,
          transactionDate: transactionDate.toISOString().split('T')[0]
        },
        existingRecord: {
          id: existingRecord.id,
          orderNo: existingRecord.orderNo,
          opcus: existingRecord.opcus,
          storeType: existingRecord.storeType,
          totalAmount: existingRecord.totalAmount,
          as400SentAt: existingRecord.as400SentAt?.toISOString(),
          transactionDate: existingRecord.transactionDate.toISOString()
        }
      })
      
      return {
        isDuplicate: true,
        location: 'main_table',
        reason: `Order ${orderNo} with store ${opcus} on ${transactionDate.toISOString().split('T')[0]} already exists in main table`,
        existingRecord,
        details: {
          orderNo: existingRecord.orderNo,
          orderItemNo: existingRecord.orderItemNo,
          opcus: existingRecord.opcus,
          storeType: existingRecord.storeType,
          totalAmount: Number(existingRecord.totalAmount),
          processedAt: existingRecord.as400SentAt?.toISOString(),
          transactionDate: existingRecord.transactionDate.toISOString()
        }
      }
    }
    
    logInfo('✅ No duplicate found in main table with 3-field check', { 
      orderNo, 
      opcus,
      transactionDate: transactionDate.toISOString().split('T')[0],
      orderItemNo 
    })
    
    return {
      isDuplicate: false,
      location: null,
      reason: null,
      existingRecord: null,
      details: null
    }
  } catch (error) {
    logError('❌ Error checking duplicate in main table', error)
    // ถ้าตรวจสอบไม่ได้ ให้ถือว่าไม่ซ้ำเพื่อป้องกันการบล็อค
    return {
      isDuplicate: false,
      location: null,
      reason: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      existingRecord: null,
      details: null
    }
  }
}

/**
 * ✅ อัปเดต - ตรวจสอบข้อมูลซ้ำใน AS400 ด้วย orderNo + opcus + transactionDate
 * เรียกใช้ฟังก์ชันใหม่จาก as400.ts
 */
export const checkDuplicateInAS400 = async (orderNo,opcus,transactionDate) => {
  try {
    logInfo('🔍 Checking duplicate in AS400 with 3-field validation', { 
      orderNo: orderNo,
      opcus: opcus,
      transactionDate: transactionDate.toISOString().split('T')[0]
    })
    
    // ✅ เรียกใช้ฟังก์ชันใหม่จาก as400.ts ที่เช็ค 3 ฟิลด์
    const { checkDuplicateOrderInAS400Direct } = await import('./as400')
    
    const as400Result = await checkDuplicateOrderInAS400Direct(orderNo, opcus, transactionDate)
    
    if (as400Result.exists) {
      logWarn('⚠️ Duplicate found in AS400 with 3-field check', { 
        searchCriteria: {
          orderNo: orderNo,
          opcus: opcus,
          transactionDate: transactionDate.toISOString().split('T')[0]
        },
        existingRecord: as400Result.existingRecord
      })
      
      return {
        isDuplicate: true,
        location: 'as400',
        reason: `Order ${orderNo} with store ${opcus} on ${transactionDate.toISOString().split('T')[0]} already exists in AS400`,
        existingRecord: as400Result.existingRecord,
        details: {
          orderNo: orderNo,
          opcus: opcus,
          transactionDate: transactionDate.toISOString().split('T')[0],
          as400Record: as400Result.existingRecord
        }
      }
    }
    
    logInfo('✅ No duplicate found in AS400 with 3-field check', {
      orderNo: orderNo,
      opcus: opcus,
      transactionDate: transactionDate.toISOString().split('T')[0]
    })
    
    return {
      isDuplicate: false,
      location: null,
      reason: null,
      existingRecord: null,
      details: null
    }
  } catch (error) {
    logError('❌ Error checking duplicate in AS400 with 3-field validation', error)
    
    return {
      isDuplicate: false,
      location: null,
      reason: `AS400 connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      existingRecord: null,
      details: null
    }
  }
}

/**
 * ✅ อัปเดต - ตรวจสอบข้อมูลซ้ำแบบครบถ้วน (ทั้ง main table และ AS400) ด้วย 3 ฟิลด์
 */
export const checkCompleteDuplicateOrder = async (orderNo,opcus,transactionDate,orderItemNo) => {
  try {
    logInfo('🔍 Starting complete duplicate check with 3-field validation', { 
      orderNo, 
      opcus,
      transactionDate: transactionDate.toISOString().split('T')[0],
      orderItemNo
    })
    
    // 1. ตรวจสอบในตาราง main ก่อน (เร็วกว่า AS400)
    const mainTableCheck = await checkDuplicateInMainTable(orderNo, opcus, transactionDate, orderItemNo)
    
    if (mainTableCheck.isDuplicate) {
      logWarn('⚠️ Duplicate found in main table - stopping check', mainTableCheck)
      return mainTableCheck
    }
    
    // 2. ถ้าไม่ซ้ำใน main table จึงตรวจสอบใน AS400
    const as400Check = await checkDuplicateInAS400(orderNo, opcus, transactionDate)
    
    if (as400Check.isDuplicate) {
      logWarn('⚠️ Duplicate found in AS400', as400Check)
      return as400Check
    }
    
    logInfo('✅ No duplicates found anywhere with 3-field validation', { 
      orderNo, 
      opcus,
      transactionDate: transactionDate.toISOString().split('T')[0],
      orderItemNo 
    })
    
    return {
      isDuplicate: false,
      location: null,
      reason: null,
      existingRecord: null,
      details: null
    }
  } catch (error) {
    logError('❌ Error in complete duplicate check with 3-field validation', error)
    
    return {
      isDuplicate: false,
      location: null,
      reason: `Complete check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      existingRecord: null,
      details: null
    }
  }
}

/**
 * ✅ อัปเดต - ตรวจสอบ duplicates แบบ batch (เร็วขึ้น) ด้วย 3 ฟิลด์
 */
export const checkBatchDuplicates = async (orders) => {
  try {
    logInfo('🔍 Starting optimized batch duplicate check with 3-field validation', { orderCount: orders.length })
    
    if (orders.length === 0) return []
    
    // 1. ตรวจสอบใน Main Table แบบ batch (เร็วกว่า)
    // ✅ อัปเดต where condition ให้เช็ค orderNo + opcus + transactionDate
    const mainTableConditions = orders.map(order => ({
      orderNo: order.orderNo,
      opcus: order.opcus,
      transactionDate: {
        gte: new Date(order.transactionDate.getFullYear(), order.transactionDate.getMonth(), order.transactionDate.getDate(), 0, 0, 0, 0),
        lte: new Date(order.transactionDate.getFullYear(), order.transactionDate.getMonth(), order.transactionDate.getDate(), 23, 59, 59, 999)
      }
    }))
    
    const mainTableDuplicates = await prisma.lazadaPaymentMain.findMany({
      where: {
        OR: mainTableConditions
      },
      select: {
        orderNo: true,
        orderItemNo: true,
        opcus: true,
        transactionDate: true,
        storeType: true,
        totalAmount: true,
        as400SentAt: true
      }
    })
    
    // ✅ อัปเดต Map key ให้รวม opcus
    const mainDuplicateMap = new Map()
    mainTableDuplicates.forEach(record => {
      const key = `${record.orderNo}|${record.opcus}|${record.transactionDate.toISOString().split('T')[0]}|${record.orderItemNo || ''}`
      mainDuplicateMap.set(key, record)
    })
    
    logInfo('📊 Main table duplicates found with 3-field check', { 
      checked: orders.length,
      duplicates: mainTableDuplicates.length 
    })
    
    // 2. สำหรับ orders ที่ไม่ซ้ำใน main table จึงตรวจสอบใน AS400
    const results = []
    let as400CheckCount = 0
    
    for (const order of orders) {
      const mainKey = `${order.orderNo}|${order.opcus}|${order.transactionDate.toISOString().split('T')[0]}|${order.orderItemNo || ''}`
      const mainDuplicate = mainDuplicateMap.get(mainKey)
      
      if (mainDuplicate) {
        // ซ้ำใน main table
        results.push({
          ...order,
          duplicateCheck: {
            isDuplicate: true,
            location: 'main_table',
            reason: `Order ${order.orderNo} with store ${order.opcus} on ${order.transactionDate.toISOString().split('T')[0]} already exists in main table`,
            existingRecord: mainDuplicate,
            details: {
              orderNo: mainDuplicate.orderNo,
              orderItemNo: mainDuplicate.orderItemNo,
              opcus: mainDuplicate.opcus,
              storeType: mainDuplicate.storeType,
              totalAmount: Number(mainDuplicate.totalAmount),
              processedAt: mainDuplicate.as400SentAt?.toISOString(),
              transactionDate: mainDuplicate.transactionDate.toISOString()
            }
          }
        })
      } else {
        // ตรวจสอบใน AS400 ด้วย 3 ฟิลด์
        as400CheckCount++
        const as400Check = await checkDuplicateInAS400(order.orderNo, order.opcus, order.transactionDate)
        
        results.push({
          ...order,
          duplicateCheck: as400Check
        })
        
        // เพิ่ม delay เล็กน้อยเพื่อป้องกัน rate limiting
        if (as400CheckCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }
    
    const duplicateCount = results.filter(r => r.duplicateCheck.isDuplicate).length
    const mainDuplicateCount = results.filter(r => r.duplicateCheck.location === 'main_table').length
    const as400DuplicateCount = results.filter(r => r.duplicateCheck.location === 'as400').length
    
    logInfo('✅ Optimized batch duplicate check completed with 3-field validation', {
      totalOrders: orders.length,
      duplicates: duplicateCount,
      unique: orders.length - duplicateCount,
      mainTableDuplicates: mainDuplicateCount,
      as400Duplicates: as400DuplicateCount,
      as400ChecksRequired: as400CheckCount
    })
    
    return results
    
  } catch (error) {
    logError('❌ Error in batch duplicate check with 3-field validation', error)
    return []
  }
}

// ฟังก์ชันสำหรับแปลงวันที่จาก Excel
export const parseExcelDate = (excelDate) => {
  try {
    logInfo('📅 Parsing Excel date', { 
      value: excelDate, 
      type: typeof excelDate 
    })
    
    // ถ้าเป็น Date object อยู่แล้ว
    if (excelDate instanceof Date) {
      logInfo('📅 Already a Date object', { 
        originalDate: excelDate.toISOString(),
        localDate: excelDate.toLocaleString('th-TH')
      })
      
      // ✅ สร้างวันที่ใหม่ด้วย local timezone และเซ็ตเวลาเป็น 07:00:00
      const year = excelDate.getFullYear()
      const month = excelDate.getMonth()
      const day = excelDate.getDate()
      const localDate = new Date(year, month, day, 7, 0, 0, 0)
      
      logInfo('✅ Date object converted to GMT+7 07:00', {
        originalDate: excelDate.toISOString(),
        fixedLocal: localDate.toISOString(),
        displayDate: localDate.toLocaleString('th-TH')
      })
      
      return localDate
    }
    
    // ถ้าเป็น Excel Serial Number (ตัวเลข)
    if (typeof excelDate === 'number') {
      logInfo('📅 Processing Excel serial number', { serialNumber: excelDate })
      
      // Excel Serial Number = จำนวนวันนับจาก 1 มกราคม 1900
      // แต่ Excel มี bug ปี 1900 ไม่ใช่ leap year แต่ Excel คิดว่าเป็น
      const excelEpoch = new Date(1900, 0, 1) // 1 มกราคม 1900 local time
      const offsetDays = excelDate - 2 // ลบ 2 วันเพื่อแก้ bug Excel
      const millisecondsPerDay = 24 * 60 * 60 * 1000
      
      // คำนวณวันที่จาก serial number
      const calculatedDate = new Date(excelEpoch.getTime() + (offsetDays * millisecondsPerDay))
      
      // ✅ สร้างวันที่ใหม่ด้วย local time และเซ็ตเวลาเป็น 07:00:00
      const year = calculatedDate.getFullYear()
      const month = calculatedDate.getMonth()
      const day = calculatedDate.getDate()
      const localDate = new Date(year, month, day, 7, 0, 0, 0)
      
      logInfo('✅ Excel serial number converted to GMT+7', {
        serialNumber: excelDate,
        calculatedDate: calculatedDate.toISOString(),
        extractedValues: { year, month, day },
        fixedLocal: localDate.toISOString(),
        displayDate: localDate.toLocaleDateString('th-TH')
      })
      
      return localDate
    }
    
    throw new Error(`Unsupported Excel date format: ${typeof excelDate}`)
    
  } catch (error) {
    logError('❌ Error parsing Excel date', { excelDate, error })
    // Fallback ไปใช้ parseTransactionDate
    logInfo('🔄 Falling back to parseTransactionDate')
    return parseTransactionDate(String(excelDate))
  }
}

// Function สำหรับแปลงวันที่ธุรกรรม
export const parseTransactionDate = (dateStr) => {
  try {
    logInfo('📅 Parsing transaction date', { dateStr })
    
    // ถ้าเป็น ISO string
    if (dateStr.includes('T') || dateStr.includes('Z')) {
      const isoDate = new Date(dateStr)
      const year = isoDate.getFullYear()
      const month = isoDate.getMonth()
      const day = isoDate.getDate()
      const localDate = new Date(year, month, day, 7, 0, 0, 0)
      
      logInfo('✅ ISO date converted to GMT+7', {
        original: dateStr,
        parsed: isoDate.toISOString(),
        fixed: localDate.toISOString()
      })
      
      return localDate
    }
    
    // ถ้าเป็นรูปแบบ DD/MM/YYYY หรือ DD-MM-YYYY
    const dateFormats = [
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,  // DD/MM/YYYY or DD-MM-YYYY
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/   // YYYY/MM/DD or YYYY-MM-DD
    ]
    
    for (const format of dateFormats) {
      const match = dateStr.match(format)
      if (match) {
        let day, month, year
        
        if (format.source.startsWith('^(\\d{4})')) {
          // YYYY/MM/DD format
          year = parseInt(match[1])
          month = parseInt(match[2]) - 1 // JavaScript months are 0-based
          day = parseInt(match[3])
        } else {
          // DD/MM/YYYY format
          day = parseInt(match[1])
          month = parseInt(match[2]) - 1 // JavaScript months are 0-based
          year = parseInt(match[3])
        }
        
        const localDate = new Date(year, month, day, 7, 0, 0, 0)
        
        logInfo('✅ Date string converted to GMT+7', {
          original: dateStr,
          parsed: { year, month: month + 1, day },
          fixed: localDate.toISOString()
        })
        
        return localDate
      }
    }
    
    // Fallback: ใช้ Date constructor
    const fallbackDate = new Date(dateStr)
    if (!isNaN(fallbackDate.getTime())) {
      const year = fallbackDate.getFullYear()
      const month = fallbackDate.getMonth()
      const day = fallbackDate.getDate()
      const localDate = new Date(year, month, day, 7, 0, 0, 0)
      
      logInfo('✅ Fallback date conversion successful', {
        original: dateStr,
        fallback: fallbackDate.toISOString(),
        fixed: localDate.toISOString()
      })
      
      return localDate
    }
    
    throw new Error(`Cannot parse date: ${dateStr}`)
    
  } catch (error) {
    logError('❌ Error parsing transaction date', { dateStr, error })
    // ถ้าแปลงไม่ได้ ให้ใช้วันนี้
    const today = new Date()
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0, 0)
    
    logWarn('⚠️ Using today as fallback date', {
      original: dateStr,
      fallback: localToday.toISOString()
    })
    
    return localToday
  }
}

// Function สำหรับบันทึก Process Log
export const createProcessLog = async (action,status,message,details,batchId,userId) => {
  try {
    await prisma.processLog.create({
      data: {
        action,
        status,
        message,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        batchId,
        userId,
      }
    })
    logInfo(`📝 Process log created: ${action} - ${status}`, { message, batchId })
  } catch (error) {
    logError('❌ Failed to create process log', error)
  }
}

// Function สำหรับการจัดการ Batch - ✅ เพิ่ม storeType และ opcus parameters
export const createBatch = async (fileName,totalRecords,uploadedBy,storeType,  // ✅ เพิ่ม parameteropcus      // ✅ เพิ่ม parameter
) => {
  try {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    const batch = await prisma.batchInfo.create({
      data: {
        batchId,
        fileName,
        totalRecords,
        status: 'UPLOADED',
        uploadedBy,
        storeType,  // ✅ เพิ่ม
        opcus       // ✅ เพิ่ม
      }
    })
    
    logInfo('📦 Batch created successfully', { 
      batchId: batch.batchId, 
      fileName: batch.fileName,
      totalRecords: batch.totalRecords,
      storeType: batch.storeType,
      opcus: batch.opcus
    })
    
    return batch
  } catch (error) {
    logError('❌ Failed to create batch', error)
    throw error
  }
}

// Function สำหรับอัปเดตสถานะ Batch - ✅ แก้ไข updatedAt field
export const updateBatchStatus = async (batchId,status,errorMessage,processedRecords) => {
  try {
    const updateData = {
      status
      // ✅ ลบ updatedAt ออกเพราะไม่มีใน schema
    }
    
    if (errorMessage) updateData.errorMessage = errorMessage
    if (processedRecords !== undefined) updateData.processedRecords = processedRecords
    if (status === 'COMPLETED') updateData.completedAt = new Date()
    
    const batch = await prisma.batchInfo.update({
      where: { batchId },
      data: updateData
    })
    
    logInfo('📦 Batch status updated', { 
      batchId: batch.batchId, 
      status: batch.status,
      processedRecords: batch.processedRecords 
    })
    
    return batch
  } catch (error) {
    logError('❌ Failed to update batch status', error)
    throw error
  }
}

// Function สำหรับคำนวณยอดเงินจาก temp data
export const calculateOrderItemTotalsFromTemp = (orderItemData) => {
  const totals = {
    itemPriceCredit: 0,
    paymentFee: 0,
    commission: 0,
    paymentFeeCorrection: 0,
    commissionFeeCorrection: 0,
    lostClaim: 0,
    otherFees: 0,
    otherIncome: 0,
    lazCoinsDiscount: 0,
    totalAmount: 0
  }
  
  for (const item of orderItemData) {
    const amount = Number(item.amount) || 0
    const feeType = item.feeNameType?.toLowerCase() || ''
    
    logInfo('🧮 Processing fee item', {
      feeType,
      amount,
      orderNo: item.orderNo,
      orderItemNo: item.orderItemNo
    })
    
    // จัดประเภท fee ตามชื่อ
    if (feeType.includes('item price credit')) {
      totals.itemPriceCredit += Math.abs(amount)
    } else if (feeType.includes('payment fee correction')) {
      totals.paymentFeeCorrection += Math.abs(amount)
    } else if (feeType.includes('commission fee correction')) {
      totals.commissionFeeCorrection += Math.abs(amount)
    } else if (feeType.includes('payment fee')) {
      totals.paymentFee += Math.abs(amount)
    } else if (feeType.includes('commission')) {
      totals.commission += Math.abs(amount)
    } else if (feeType.includes('lost claim')) {
      totals.lostClaim += Math.abs(amount)
    } else if (feeType.includes('lazcoins discount')) {
      totals.lazCoinsDiscount += Math.abs(amount)
    } else if (amount > 0) {
      // รายรับอื่นๆ (บวก)
      totals.otherIncome += amount
    } else {
      // ค่าใช้จ่ายอื่นๆ (ลบ)
      totals.otherFees += Math.abs(amount)
    }
  }
  
  // คำนวณยอดรวม = รายรับ - ค่าใช้จ่าย
  totals.totalAmount = totals.itemPriceCredit + totals.otherIncome + totals.lostClaim 
    - totals.paymentFee - totals.commission - totals.otherFees - totals.lazCoinsDiscount
  
  logInfo('💰 Order item totals calculated', {
    ...totals,
    itemCount: orderItemData.length
  })
  
  return totals
}