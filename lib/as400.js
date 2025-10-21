// lib/as400.ts - ไฟล์สมบูรณ์พร้อมแก้ไข OTAMT ให้รักษาค่าลบ
import { logError, logInfo, logWarn } from './database'

// Interface สำหรับข้อมูลที่ส่งไป AS400
// export interface AS400TransferData {
//   OSEQ: string    // Sequence number (4 digits)
//   OPCUS: string   // Customer/Store code (988899 = WAIWAI, 989902 = SUDA)
//   OPBIL: string   // Order No (already truncated)
//   OPMDT: string   // Transaction Date (YYYYMMDD)
//   ORTNA: number   // Lost Claim
//   OSCAM: number   // 0 (ไม่ใช้)
//   OSBAM: number   // 0 (ไม่ใช้)
//   OSTAM: number   // 0 (ไม่ใช้)
//   OSAAM: number   // 0 (ไม่ใช้)
//   ORSAM: number   // LazCoins Discount
//   OSRAM: number   // ค่าใช้จ่ายอื่นๆ (otherFees)
//   OCOM1: number   // Commission (absolute value)
//   OCOM2: number   // Commission Fee Correction
//   OSERV: number   // Payment Fee Correction
//   OTRANS: number  // Payment Fee (absolute value)
//   OTAMT: number   // Total Deductions (ใช้ค่าบวกปกติ)
//   OTRAM: number   // Net Transfer Amount ✅ รักษาค่าลบไว้
//   OBAMT: number   // Bill Amount (Item Price Credit + Other Income + Lost Claim)
//   OTDTE: string   // Transfer Date (YYYYMMDD)
//   OTIME: string   // Transfer Time (HHMMSS)
// }

// Interface สำหรับการตอบกลับจาก AS400
// export interface AS400Response {
//   success: boolean
//   recordsInserted: number
//   errorMessage?: string
//   details?: any[]
// }

// Interface สำหรับการตรวจสอบ Order ซ้ำ - ✅ อัปเดตเพื่อรองรับการเช็ค 3 ฟิลด์
// export interface AS400DuplicateCheck {
//   orderNo: string
//   opcus?: string
//   transactionDate?: string
//   exists: boolean
//   existingRecord?: any
// }

// AS400 Connection Configuration (ใช้ environment variables)
const AS400_CONFIG = {
  dsn: process.env.AS400_DSN || 'TESTF',
  uid: process.env.AS400_UID || 'SSA',
  pwd: process.env.AS400_PWD || 'SSA',
  library: process.env.AS400_LIBRARY || 'TESTF',
  file: 'PMONHP',
  encoding: '1208', // UTF-8 encoding for AS400
  connectionTimeout: 30000, // 30 seconds
  queryTimeout: 60000, // 60 seconds
}

/**
 * สร้าง ODBC Connection String สำหรับ AS400
 */
function createAS400ConnectionString() {
  return `DSN=${AS400_CONFIG.dsn};UID=${AS400_CONFIG.uid};PWD=${AS400_CONFIG.pwd};`
}

/**
 * ✅ ฟังก์ชันตัด Order No ให้เหลือ 15 หลัก (เหมือนเดิม)
 */
export function truncateOrderNoForAS400(orderNo){
  const maxLength = 15
  const truncated = orderNo.length > maxLength 
    ? orderNo.substring(0, maxLength)
    : orderNo
    
  if (orderNo.length > maxLength) {
    logInfo('✂️ Order No truncated for AS400', {
      original: orderNo,
      truncated: truncated,
      originalLength: orderNo.length,
      truncatedLength: truncated.length
    })
  }
  
  return truncated
}

/**
 * ฟังก์ชันแปลงข้อมูลเป็นรูปแบบสำหรับ AS400
 * ✅ แก้ไข: รักษาค่าลบสำหรับ OTAMT และปรับปรุงการคำนวณให้ถูกต้อง
 */
export function formatForAS400(data) {
  const now = new Date()
  const transferDate = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const transferTime = now.toTimeString().slice(0, 8).replace(/:/g, '')   // HHMMSS
  
  // ตัด Order No
  const truncatedOrderNo = truncateOrderNoForAS400(data.orderNo)
  
  // แปลงวันที่ธุรกรรม
  const transactionDateFormatted = data.transactionDate.toISOString().slice(0, 10).replace(/-/g, '')
  
  // ✅ คำนวณยอดเงิน - รักษาค่าลบไว้สำหรับ OTAMT
  const billAmount = Math.abs(data.itemPriceCredit) + Math.abs(data.otherIncome) + Math.abs(data.lostClaim)
  
  // ✅ คำนวณ Total Deductions (ปกติสำหรับ OTAMT)
  const totalDeductions = Math.abs(data.paymentFee) + Math.abs(data.commission) + Math.abs(data.otherFees)// + Math.abs(data.lazCoinsDiscount)
  
  // ✅ คำนวณ Net Transfer Amount (OTRAM) โดยรักษาค่าลบไว้
  const netTransferAmount = data.totalAmount // รักษาค่าเดิมไว้ไม่ใช้ Math.abs()
  
  logInfo('📊 AS400 OTRAM calculation details', {
    orderNo: data.orderNo,
    originalTotalAmount: data.totalAmount,
    calculatedOTRAM: netTransferAmount,
    calculatedOTAMT: totalDeductions,
    note: 'OTRAM will preserve negative values (net transfer amount)'
  })
  
  const as400Record = {
    OSEQ: data.sequence.toString().padStart(4, '0'),
    OPCUS: data.opcus,
    OPBIL: truncatedOrderNo,
    OPMDT: transactionDateFormatted,
    ORTNA: Math.abs(data.lostClaim),
    OSCAM: 0,
    OSBAM: 0,
    OSTAM: 0,
    OSAAM: 0,
    ORSAM: Math.abs(data.lazCoinsDiscount),  // LazCoins Discount
    OSRAM: Math.abs(data.otherFees),
    OCOM1: Math.abs(data.commission),
    OCOM2: Math.abs(data.commissionFeeCorrection),
    OSERV: Math.abs(data.paymentFeeCorrection),
    OTRANS: Math.abs(data.paymentFee),
    OTAMT: totalDeductions, // ใช้ค่าบวกปกติ
    OTRAM: netTransferAmount, // ✅ รักษาค่าลบไว้
    OBAMT: billAmount,
    OTDTE: transferDate,
    OTIME: transferTime
  }
  
  logInfo('🔄 AS400 record formatted with preserved negative OTRAM', {
    originalOrderNo: data.orderNo,
    truncatedOrderNo: truncatedOrderNo,
    sequence: as400Record.OSEQ,
    opcus: as400Record.OPCUS,
    billAmount: as400Record.OBAMT,
    netAmount: as400Record.OTRAM, // ✅ แสดงค่า OTRAM ที่รักษาค่าลบไว้
    totalDeductions: as400Record.OTAMT,
    transactionDate: as400Record.OPMDT,
    note: 'OTRAM preserves negative values for net transfer amount'
  })
  
  return as400Record
}

/**
 * ✅ ตรวจสอบข้อมูลซ้ำใน AS400 ด้วย 3 ฟิลด์: OPCUS + OPBIL + OPMDT
 */
export async function checkDuplicateInAS400(orderNo, opcus,transactionDate) {
  try {
    logInfo('🔍 Checking AS400 duplicate with 3-field validation', { 
      orderNo, 
      opcus,
      transactionDate: transactionDate.toISOString().split('T')[0]
    })
    
    const odbc = require('odbc')
    
    // Connection string แบบเดียวกับไฟล์เดิม
    const connectionString = createAS400ConnectionString()
    
    logInfo('🔌 AS400 connection string created for duplicate check', { 
      dsn: AS400_CONFIG.dsn, 
      uid: AS400_CONFIG.uid, 
      library: AS400_CONFIG.library,
      encoding: AS400_CONFIG.encoding
    })
    
    let connection
    try {
      connection = await odbc.connect(connectionString)
      logInfo('🔗 Connected to AS400 for duplicate check', { dsn: AS400_CONFIG.dsn })
    } catch (connectionError) {
      logError('❌ Failed to connect to AS400 for duplicate check', connectionError)
      
      return {
        isDuplicate: false,
        location: null,
        reason: `AS400 connection error: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}`,
        existingRecord: null,
        details: null
      }
    }
    
    try {
      // ตัด orderNo ให้เหลือ 15 หลัก เหมือนที่ส่งเข้า AS400
      const truncatedOrderNo = truncateOrderNoForAS400(orderNo)
      
      // แปลงวันที่เป็นรูปแบบ YYYYMMDD
      const transactionDateStr = transactionDate.toISOString().slice(0, 10).replace(/-/g, '')
      
      // ✅ อัปเดต SQL query ให้เช็ค 3 ฟิลด์: OPCUS + OPBIL + OPMDT
      const sql = `
        SELECT OSEQ, OPCUS, OPBIL, OPMDT, OTRAM, OBAMT 
        FROM ${AS400_CONFIG.library}.${AS400_CONFIG.file}
        WHERE OPCUS = ? AND OPBIL = ? AND OPMDT = ?
        FETCH FIRST 1 ROWS ONLY
      `
      
      logInfo('🔍 Executing AS400 duplicate check query with 3-field validation', {
        sql: sql.trim(),
        parameters: [opcus, truncatedOrderNo, transactionDateStr]
      })
      
      const result = await connection.query(sql, [opcus, truncatedOrderNo, transactionDateStr])
      
      const hasDuplicate = result && result.length > 0
      
      if (hasDuplicate) {
        const existingRecord = result[0]
        
        logWarn('⚠️ Duplicate found in AS400 with 3-field check', {
          searchCriteria: { opcus, truncatedOrderNo, transactionDateStr },
          existingRecord: {
            OSEQ: existingRecord.OSEQ,
            OPCUS: existingRecord.OPCUS,
            OPBIL: existingRecord.OPBIL,
            OPMDT: existingRecord.OPMDT,
            OTRAM: existingRecord.OTRAM,
            OBAMT: existingRecord.OBAMT
          }
        })
        
        return {
          isDuplicate: true,
          location: 'as400',
          reason: `Order ${orderNo} with store ${opcus} on ${transactionDateStr} already exists in AS400`,
          existingRecord,
          details: {
            opcus: existingRecord.OPCUS,
            orderNo: existingRecord.OPBIL,
            transactionDate: existingRecord.OPMDT,
            sequence: existingRecord.OSEQ,
            netAmount: existingRecord.OTRAM,
            billAmount: existingRecord.OBAMT
          }
        }
      }
      
      logInfo('✅ No duplicate found in AS400 with 3-field check', { 
        opcus, 
        truncatedOrderNo, 
        transactionDateStr 
      })
      
      return {
        isDuplicate: false,
        location: null,
        reason: null,
        existingRecord: null,
        details: null
      }
      
    } finally {
      await connection.close()
      logInfo('🔌 AS400 connection closed after duplicate check')
    }
    
  } catch (error) {
    logError('❌ Error checking AS400 duplicate with 3-field validation', error)
    
    return {
      isDuplicate: false,
      location: null,
      reason: `AS400 check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      existingRecord: null,
      details: null
    }
  }
}

/**
 * ✅ ฟังก์ชันตรวจสอบ duplicate ใน AS400 โดยตรง (สำหรับเรียกจาก database.ts)
 */
export async function checkDuplicateOrderInAS400Direct(orderNo, opcus,transactionDate) {
  try {
    const result = await checkDuplicateInAS400(orderNo, opcus, transactionDate)
    
    return {
      orderNo,
      opcus,
      transactionDate: transactionDate.toISOString().split('T')[0],
      exists: result.isDuplicate,
      existingRecord: result.existingRecord
    }
  } catch (error) {
    logError('❌ Error in checkDuplicateOrderInAS400Direct', error)
    
    return {
      orderNo,
      opcus,
      transactionDate: transactionDate.toISOString().split('T')[0],
      exists: false
    }
  }
}

/**
 * ✅ ฟังก์ชันเก่าสำหรับ backward compatibility (deprecated)
 */
export async function checkDuplicateOrderInAS400(orderNo){
  logWarn('⚠️ Using deprecated checkDuplicateOrderInAS400 (orderNo only)', { 
    orderNo,
    recommendation: 'Use checkDuplicateInAS400 with 3-field validation instead'
  })
  
  try {
    const odbc = require('odbc')
    const connectionString = createAS400ConnectionString()
    
    const connection = await odbc.connect(connectionString)
    
    try {
      const truncatedOrderNo = truncateOrderNoForAS400(orderNo)
      
      const sql = `
        SELECT OSEQ, OPCUS, OPBIL, OPMDT, OTRAM, OBAMT 
        FROM ${AS400_CONFIG.library}.${AS400_CONFIG.file}
        WHERE OPBIL = ?
        FETCH FIRST 1 ROWS ONLY
      `
      
      const result = await connection.query(sql, [truncatedOrderNo])
      
      return {
        orderNo,
        exists: result && result.length > 0,
        existingRecord: result && result.length > 0 ? result[0] : undefined
      }
      
    } finally {
      await connection.close()
    }
    
  } catch (error) {
    logError('❌ Error in deprecated checkDuplicateOrderInAS400', error)
    
    return {
      orderNo,
      exists: false
    }
  }
}

/**
 * ฟังก์ชันส่งข้อมูลเข้า AS400
 */
export async function transferToAS400(records) {
  if (!records || records.length === 0) {
    logWarn('⚠️ No records to transfer to AS400')
    return {
      success: false,
      recordsInserted: 0,
      errorMessage: 'No records provided'
    }
  }
  
  logInfo('🚀 Starting AS400 transfer', { recordCount: records.length })
  
  try {
    const odbc = require('odbc')
    
    // Connection string แบบเดียวกับไฟล์เดิม
    const connectionString = createAS400ConnectionString()
    
    logInfo('🔌 AS400 connection string created', { 
      dsn: AS400_CONFIG.dsn, 
      uid: AS400_CONFIG.uid, 
      library: AS400_CONFIG.library,
      encoding: AS400_CONFIG.encoding
    })
    
    const connection = await odbc.connect(connectionString)
    logInfo('🔗 Connecting to AS400 for transfer', { dsn: AS400_CONFIG.dsn })
    
    let insertedCount = 0
    const errors = []
    
    try {
      // ตั้งค่า transaction
      try {
        await connection.query('SET AUTOCOMMIT OFF')
        logInfo('🔄 Transaction started')
      } catch (autoCommitError) {
        logWarn('⚠️ SET AUTOCOMMIT failed, continuing without explicit transaction', autoCommitError)
      }
      
      // SQL สำหรับ INSERT
      const insertSQL = `
        INSERT INTO ${AS400_CONFIG.library}.${AS400_CONFIG.file}
        (OSEQ, OPCUS, OPBIL, OPMDT, ORTNA, OSCAM, OSBAM, OSTAM, OSAAM, ORSAM, OSRAM, 
        OCOM1, OCOM2, OSERV, OTRANS, OTAMT, OTRAM, OBAMT, OTDTE, OTIME)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      logInfo('📝 Preparing INSERT statement', {
        sql: insertSQL,
        recordCount: records.length
      })
      
      // Insert แต่ละระเบียน
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        
        try {
          logInfo(`📤 Inserting record ${i + 1}/${records.length}`, {
            OSEQ: record.OSEQ,
            OPCUS: record.OPCUS,
            OPBIL: record.OPBIL,
            OPMDT: record.OPMDT,
            OTRAM: record.OTRAM,
            OBAMT: record.OBAMT,
            OTAMT: record.OTAMT,
            note: 'OTRAM shows negative values for net losses'
          })
          
          await connection.query(insertSQL, [
            record.OSEQ,
            record.OPCUS,
            record.OPBIL,
            record.OPMDT,
            record.ORTNA,
            record.OSCAM,
            record.OSBAM,
            record.OSTAM,
            record.OSAAM,
            record.ORSAM,
            record.OSRAM,
            record.OCOM1,
            record.OCOM2,
            record.OSERV,
            record.OTRANS,
            record.OTAMT, // ใช้ค่าบวกปกติ
            record.OTRAM, // ✅ ส่งค่าลบไปด้วย (Net Transfer Amount)
            record.OBAMT,
            record.OTDTE,
            record.OTIME
          ])
          
          insertedCount++
          logInfo(`✅ Record ${i + 1} inserted successfully`, { 
            orderNo: record.OPBIL, 
            netAmount: record.OTRAM, // ✅ แสดงค่า OTRAM ที่รักษาค่าลบไว้
            totalDeductions: record.OTAMT
          })
          
        } catch (recordError) {
          const errorMsg = `Record ${i + 1}: ${recordError instanceof Error ? recordError.message : 'Unknown error'}`
          errors.push(errorMsg)
          logError(`❌ Insert failed for record ${i + 1}`, {
            record: record,
            error: recordError
          })
        }
      }
      
      // Commit transaction
      try {
        await connection.query('COMMIT')
        logInfo('✅ Transaction committed successfully', { insertedCount })
      } catch (commitError) {
        logWarn('⚠️ COMMIT failed, but data might still be saved', commitError)
      }
      
    } catch (generalError) {
      logError('❌ General error during AS400 transfer', generalError)
      
      // Rollback transaction
      try {
        await connection.query('ROLLBACK')
        logInfo('🔄 Transaction rolled back')
      } catch (rollbackError) {
        logError('❌ Rollback also failed', rollbackError)
      }
      
      throw generalError
    } finally {
      await connection.close()
      logInfo('🔌 AS400 connection closed')
    }
    
    const success = insertedCount > 0
    
    logInfo('🏁 AS400 transfer completed', {
      success,
      insertedCount,
      totalRecords: records.length,
      errorCount: errors.length,
      errors: errors.slice(0, 5) // แสดงแค่ 5 error แรก
    })
    
    return {
      success,
      recordsInserted: insertedCount,
      errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
      details: errors.length > 0 ? errors : undefined
    }
    
  } catch (error) {
    logError('❌ AS400 transfer failed completely', error)
    
    return {
      success: false,
      recordsInserted: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown transfer error'
    }
  }
}