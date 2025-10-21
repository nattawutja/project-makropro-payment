// lib/fileUtils.ts - Updated for 3-field duplicate checking (orderNo + opcus + transactionDate)
import * as XLSX from 'xlsx'
import { logError, logInfo, logWarn, parseTransactionDate, parseExcelDate, checkBatchDuplicates } from './database'


/**
 * อ่านข้อมูลจากไฟล์ Excel และประมวลผล
 */
export const readExcelFile = (buffer) => {
  try {
    logInfo('📂 Reading Excel file from buffer', { bufferSize: buffer.length })
    
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
      cellText: false
    })
    
    logInfo('✅ Excel file read successfully', {
      sheetNames: workbook.SheetNames,
      sheetCount: workbook.SheetNames.length
    })
    
    return workbook
  } catch (error) {
    logError('❌ Error reading Excel file', error)
    throw new Error(`ไม่สามารถอ่านไฟล์ Excel ได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * แปลงข้อมูลจาก Excel worksheet เป็น JSON
 */
export const worksheetToJson = (worksheet) => {
  try {
    logInfo('🔄 Converting worksheet to JSON')
    
    // ลองใช้วิธีอื่นในการอ่านข้อมูล
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false  // 🆕 เพิ่ม raw: false เพื่อแปลงข้อมูลเป็น string
    })
    
    logInfo('📋 Raw JSON data from Excel', { 
      totalRows: jsonData.length,
      firstFewRows: jsonData.slice(0, 3)
    })
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error('ไฟล์ Excel ไม่มีข้อมูลเลย')
    }
    
    if (jsonData.length < 2) {
      throw new Error('ไฟล์ Excel ไม่มีข้อมูลหรือมีแค่ header เท่านั้น')
    }
    
    // ใช้แถวแรกเป็น header
    const headers = jsonData[0]
    const dataRows = jsonData.slice(1)
    
    logInfo('📋 Excel headers found', { 
      headers,
      dataRowCount: dataRows.length,
      sampleDataRow: dataRows[0]
    })
    
    // ตรวจสอบ headers ที่จำเป็น
    const requiredHeaders = ['Transaction Date', 'Order No.', 'Fee Name', 'Amount']
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h && h.toString().toLowerCase().includes(header.toLowerCase()))
    )
    
    if (missingHeaders.length > 0) {
      logWarn('⚠️ Missing required headers', { 
        missingHeaders, 
        availableHeaders: headers 
      })
    }
    
    // แปลงเป็น object array
    const processedData = dataRows
      .filter(row => {
        // ตรวจสอบว่าแถวมีข้อมูลจริงหรือไม่
        const hasData = row && row.length > 0 && row.some(cell => 
          cell !== '' && cell !== null && cell !== undefined
        )
        return hasData
      })
      .map((row, index) => {
        const obj = {}
        headers.forEach((header, colIndex) => {
          if (header) {  // เฉพาะ header ที่ไม่ว่าง
            obj[header] = row[colIndex] || ''
          }
        })
        
        logInfo(`📄 Processing row ${index + 1}`, {
          rowIndex: index + 1,
          rowData: obj,
          hasOrderNo: !!obj['Order No.'],
          hasAmount: !!obj['Amount']
        })
        
        return obj
      })
    
    logInfo('✅ Worksheet converted to JSON', {
      totalRows: dataRows.length,
      validRows: processedData.length,
      sampleProcessedData: processedData.slice(0, 2)
    })
    
    if (processedData.length === 0) {
      throw new Error('ไม่พบข้อมูลที่ใช้งานได้ในไฟล์ Excel')
    }
    
    return processedData
  } catch (error) {
    logError('❌ Error converting worksheet to JSON', error)
    throw new Error(`ไม่สามารถแปลงข้อมูล Excel ได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * ✅ อัปเดต - ประมวลผลข้อมูล Lazada และตรวจสอบ duplicate ด้วย 3 ฟิลด์
 * เพิ่ม opcus parameter เพื่อตรวจสอบข้อมูลซ้ำแบบใหม่
 */
export const processLazadaData = async (rawData,opcus // 🆕 เพิ่ม opcus parameter สำหรับตรวจสอบ duplicate
) => {
  try {
    logInfo('🔄 Starting Lazada data processing with 3-field duplicate check', { 
      totalRecords: rawData.length,
      opcus: opcus || 'NOT_PROVIDED'
    })
    
    const errors = []
    const warnings = []
    const duplicateDetails = []
    
    if (!rawData || rawData.length === 0) {
      return {
        success: false,
        errors: ['ไม่มีข้อมูลที่จะประมวลผล']
      }
    }
    
    // Step 1: ประมวลผลข้อมูลเบื้องต้น (เหมือนเดิม)
    const initialProcessedData = []
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      
      try {
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!row['Order No.'] || !row['Fee Name'] || row['Amount'] === undefined) {
          errors.push(`แถว ${i + 2}: ข้อมูลไม่ครบถ้วน - ไม่มี Order No, Fee Name หรือ Amount`)
          continue
        }
        
        // แปลงวันที่
        let transactionDate
        try {
          if (row['Transaction Date']) {
            transactionDate = parseExcelDate(row['Transaction Date'])
          } else {
            throw new Error('ไม่มีวันที่ธุรกรรม')
          }
        } catch (dateError) {
          errors.push(`แถว ${i + 2}: ไม่สามารถแปลงวันที่ได้ - ${dateError instanceof Error ? dateError.message : 'Unknown error'}`)
          continue
        }
        
        // สร้างข้อมูลที่ประมวลผลแล้ว
        const processedItem = {
          transactionDate,
          orderNo: String(row['Order No.']).trim(),
          orderItemNo: String(row['Order Item No.'] || '').trim(),
          feeNameType: String(row['Fee Name']).trim(),
          amount: Number(row['Amount']) || 0,
          details: row['Details'] ? String(row['Details']).trim() : undefined,
          sellerSku: row['Seller SKU'] ? String(row['Seller SKU']).trim() : undefined,
          vatAmount: row['VAT in Amount'] ? Number(row['VAT in Amount']) : undefined,
          whtAmount: row['WHT Amount'] ? Number(row['WHT Amount']) : undefined,
          transactionNumber: row['Transaction Number'] ? String(row['Transaction Number']).trim() : undefined,
          reference: row['Reference'] ? String(row['Reference']).trim() : undefined,
          comment: row['Comment'] ? String(row['Comment']).trim() : undefined
        }
        
        initialProcessedData.push(processedItem)
        
      } catch (rowError) {
        errors.push(`แถว ${i + 2}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
      }
    }
    
    logInfo('📊 Initial data processing completed', {
      totalRows: rawData.length,
      processedRows: initialProcessedData.length,
      errorRows: errors.length
    })
    
    if (initialProcessedData.length === 0) {
      return {
        success: false,
        errors: errors.length > 0 ? errors : ['ไม่มีข้อมูลที่สามารถประมวลผลได้']
      }
    }
    
    // ✅ Step 2: ตรวจสอบ duplicate ด้วย 3 ฟิลด์ (เฉพาะถ้ามี opcus)
    if (opcus) {
      logInfo('🔍 Starting 3-field duplicate check', { opcus })
      
      // สร้างรายการ unique orders สำหรับตรวจสอบ duplicates
     const uniqueOrdersMap = new Map();

      initialProcessedData.forEach(item => {
        const key = `${item.orderNo}|${opcus}|${item.transactionDate.toISOString().split('T')[0]}|${item.orderItemNo}`
        if (!uniqueOrdersMap.has(key)) {
          uniqueOrdersMap.set(key, {
            orderNo: item.orderNo,
            opcus: opcus,          // 🆕 เพิ่ม opcus
            transactionDate: item.transactionDate,
            orderItemNo: item.orderItemNo
          })
        }
      })
      
      const uniqueOrders = Array.from(uniqueOrdersMap.values())
      
      logInfo('🔍 Starting batch duplicate check with 3-field validation', { 
        totalRecords: initialProcessedData.length,
        uniqueOrdersToCheck: uniqueOrders.length,
        opcus: opcus,
        sampleUniqueOrders: uniqueOrders.slice(0, 3).map(o => ({
          orderNo: o.orderNo,
          opcus: o.opcus,
          orderItemNo: o.orderItemNo,
          transactionDate: o.transactionDate.toISOString(),
          displayDate: o.transactionDate.toLocaleDateString('th-TH')
        }))
      })
      
      // ✅ Step 3: เรียกใช้ checkBatchDuplicates ด้วย 3 ฟิลด์
      const duplicateCheckResults = await checkBatchDuplicates(uniqueOrders)
      
      // Step 4: สร้าง map สำหรับ lookup duplicates
        const duplicateMap = new Map();

      let duplicateInMain = 0
      let duplicateInAS400 = 0
      
      duplicateCheckResults.forEach(result => {
        const key = `${result.orderNo}|${result.opcus}|${result.transactionDate.toISOString().split('T')[0]}|${result.orderItemNo || ''}`
        duplicateMap.set(key, result.duplicateCheck)
        
        if (result.duplicateCheck.isDuplicate) {
          if (result.duplicateCheck.location === 'main_table') {
            duplicateInMain++
          } else if (result.duplicateCheck.location === 'as400') {
            duplicateInAS400++
          }
          
          duplicateDetails.push({
            orderNo: result.orderNo,
            opcus: result.opcus,
            transactionDate: result.transactionDate.toISOString().split('T')[0],
            location: result.duplicateCheck.location || 'unknown',
            reason: result.duplicateCheck.reason || 'Unknown duplicate',
            details: result.duplicateCheck.details
          })
        }
      })
      
      logInfo('📊 Duplicate check results summary with 3-field validation', {
        totalUniqueOrders: uniqueOrders.length,
        duplicatesFound: duplicateDetails.length,
        duplicateInMain,
        duplicateInAS400,
        opcus: opcus,
        duplicateDetails: duplicateDetails.slice(0, 5).map(d => ({
          orderNo: d.orderNo,
          opcus: d.opcus,
          location: d.location,
          reason: d.reason
        }))
      })
      
      // Step 5: ใส่ข้อมูล duplicate กลับไปในข้อมูลที่ประมวลผลแล้ว
      initialProcessedData.forEach(item => {
        const key = `${item.orderNo}|${opcus}|${item.transactionDate.toISOString().split('T')[0]}|${item.orderItemNo}`
        const duplicateCheck = duplicateMap.get(key)
        
        if (duplicateCheck && duplicateCheck.isDuplicate) {
          item.isDuplicate = true
          item.duplicateReason = duplicateCheck.reason
          item.duplicateLocation = duplicateCheck.location
          item.duplicateDetails = duplicateCheck.details
          
          logWarn(`⚠️ Marking record as duplicate (3-field check)`, {
            orderNo: item.orderNo,
            opcus: opcus,
            orderItemNo: item.orderItemNo,
            transactionDate: item.transactionDate.toISOString(),
            location: duplicateCheck.location,
            reason: duplicateCheck.reason
          })
        } else {
          item.isDuplicate = false
        }
      })
      
      // Step 6: แยกข้อมูลที่ไม่ซ้ำออกมา (เฉพาะที่จะเอาเข้า temp table)
      const validNonDuplicateData = initialProcessedData.filter(item => !item.isDuplicate)
      
      logInfo('📊 Final data filtering completed with 3-field duplicate check', {
        totalProcessed: initialProcessedData.length,
        duplicates: initialProcessedData.length - validNonDuplicateData.length,
        validNonDuplicates: validNonDuplicateData.length,
        opcus: opcus,
        finalSampleDates: validNonDuplicateData.slice(0, 3).map(d => ({
          orderNo: d.orderNo,
          transactionDate: d.transactionDate.toISOString(),
          displayDate: d.transactionDate.toLocaleDateString('th-TH'),
          note: 'These dates should now be correct in GMT+7'
        }))
      })
      
      // Step 7: สร้าง summary
      const uniqueOrdersAfterFilter = new Set(
        validNonDuplicateData.map(d => `${d.orderNo}-${d.orderItemNo}`)
      ).size
      
      const summary = {
        totalRecords: rawData.length,
        validRecords: validNonDuplicateData.length, // เฉพาะที่ไม่ซ้ำ
        invalidRecords: rawData.length - initialProcessedData.length,
        uniqueOrders: uniqueOrdersAfterFilter,
        duplicateRecords: initialProcessedData.length - validNonDuplicateData.length,
        duplicateInMain,
        duplicateInAS400
      }
      
      logInfo('✅ Data processing with 3-field duplicate check completed', summary)
      
      // เพิ่ม warnings สำหรับ duplicates
      if (duplicateDetails.length > 0) {
        warnings.push(`พบข้อมูลซ้ำ ${duplicateDetails.length} รายการ (เช็คด้วย Order No + Store + วันที่):`)
        duplicateDetails.forEach((dup, index) => {
          if (index < 10) { // แสดงแค่ 10 รายการแรก
            const location = dup.location === 'main_table' ? 'ตาราง Main' : 
                            dup.location === 'as400' ? 'ระบบ AS400' : 'ไม่ทราบ'
            warnings.push(`- Order ${dup.orderNo} (${dup.opcus}) วันที่ ${dup.transactionDate}: ซ้ำใน${location}`)
          }
        })
        if (duplicateDetails.length > 10) {
          warnings.push(`... และอีก ${duplicateDetails.length - 10} รายการ`)
        }
      }
      
      return {
        success: errors.length === 0 || validNonDuplicateData.length > 0,
        data: validNonDuplicateData, // ส่งเฉพาะข้อมูลที่ไม่ซ้ำ
        summary,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        duplicateDetails
      }
      
    } else {
      // ✅ ถ้าไม่มี opcus ให้ส่งข้อมูลทั้งหมดไปเหมือนเดิม (ไม่เช็ค duplicate)
      logWarn('⚠️ No opcus provided - skipping duplicate check', {
        totalProcessed: initialProcessedData.length,
        note: 'Duplicate checking requires opcus parameter'
      })
      
      const uniqueOrdersCount = new Set(
        initialProcessedData.map(d => `${d.orderNo}-${d.orderItemNo}`)
      ).size
      
      const summary = {
        totalRecords: rawData.length,
        validRecords: initialProcessedData.length,
        invalidRecords: rawData.length - initialProcessedData.length,
        uniqueOrders: uniqueOrdersCount,
        duplicateRecords: 0,
        duplicateInMain: 0,
        duplicateInAS400: 0
      }
      
      warnings.push('ไม่ได้ตรวจสอบข้อมูลซ้ำเนื่องจากไม่ได้ระบุร้านค้า')
      
      return {
        success: errors.length === 0 || initialProcessedData.length > 0,
        data: initialProcessedData,
        summary,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        duplicateDetails: []
      }
    }
    
  } catch (error) {
    logError('❌ Error in processLazadaData with 3-field duplicate check', error)
    return {
      success: false,
      errors: [`เกิดข้อผิดพลาดในการประมวลผลข้อมูล: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

/**
 * ตรวจสอบรูปแบบไฟล์ Excel
 */
export const validateExcelFile = (buffer) => {
  try {
    logInfo('✅ Validating Excel file format')
    
    const workbook = readExcelFile(buffer)
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { isValid: false, error: 'ไฟล์ Excel ไม่มี worksheet' }
    }
    
    // ตรวจสอบ worksheet แรก
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    if (!worksheet) {
      return { isValid: false, error: 'ไม่สามารถอ่าน worksheet ได้' }
    }
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (!jsonData || jsonData.length < 2) {
      return { isValid: false, error: 'ไฟล์ Excel ไม่มีข้อมูลหรือมีแค่ header' }
    }
    
    logInfo('✅ Excel file validation passed', {
      sheetCount: workbook.SheetNames.length,
      firstSheetName,
      dataRowCount: jsonData.length - 1
    })
    
    return { isValid: true }
    
  } catch (error) {
    logError('❌ Excel file validation failed', error)
    return {
      isValid: false,
      error: `ไฟล์ Excel ไม่ถูกต้อง: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * ตรวจสอบรูปแบบไฟล์
 */
export const validateFileFormat = (fileName) => {
  try {
    logInfo('🔍 Validating file format', { fileName })
    
    if (!fileName) {
      return { isValid: false, error: 'ไม่ได้ระบุชื่อไฟล์' }
    }
    
    const fileExtension = fileName.toLowerCase().split('.').pop()
    const allowedExtensions = ['xlsx', 'xls']
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `รองรับเฉพาะไฟล์ ${allowedExtensions.join(', ')} เท่านั้น (ได้รับ: ${fileExtension})` 
      }
    }
    
    logInfo('✅ File format validation passed', { fileName, fileExtension })
    return { isValid: true }
    
  } catch (error) {
    logError('❌ File format validation failed', error)
    return { 
      isValid: false, 
      error: `ไม่สามารถตรวจสอบรูปแบบไฟล์ได้: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * ตรวจสอบขนาดไฟล์
 */
export const validateFileSize = (fileSize, maxSizeMB = 10) => {
  try {
    logInfo('📏 Validating file size', { fileSize, maxSizeMB })
    
    if (fileSize <= 0) {
      return { isValid: false, error: 'ไฟล์ว่างเปล่า' }
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024 // แปลง MB เป็น bytes
    
    if (fileSize > maxSizeBytes) {
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)
      return { 
        isValid: false, 
        error: `ไฟล์ใหญ่เกินไป (${fileSizeMB} MB) สูงสุดที่อนุญาต: ${maxSizeMB} MB` 
      }
    }
    
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)
    logInfo('✅ File size validation passed', { fileSize, fileSizeMB: `${fileSizeMB} MB`, maxSizeMB })
    
    return { isValid: true }
    
  } catch (error) {
    logError('❌ File size validation failed', error)
    return { 
      isValid: false, 
      error: `ไม่สามารถตรวจสอบขนาดไฟล์ได้: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * สกัดข้อมูลจากไฟล์ Excel
 */
export const extractDataFromExcel = async (buffer,opcus) => {
  try {
    logInfo('📂 Starting Excel data extraction with 3-field duplicate check', { 
      bufferSize: buffer.length,
      opcus: opcus || 'NOT_PROVIDED'
    })
    
    // ตรวจสอบไฟล์
    const validation = validateExcelFile(buffer)
    if (!validation.isValid) {
      return {
        success: false,
        errors: [validation.error || 'ไฟล์ Excel ไม่ถูกต้อง']
      }
    }
    
    // อ่านข้อมูล
    const workbook = readExcelFile(buffer)
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // แปลงเป็น JSON
    const rawData = worksheetToJson(worksheet)
    
    // ✅ ประมวลผลข้อมูลพร้อมตรวจสอบ duplicate ด้วย opcus
    const result = await processLazadaData(rawData, opcus)
    
    logInfo('✅ Excel data extraction completed with 3-field duplicate check', {
      success: result.success,
      totalRecords: result.summary?.totalRecords || 0,
      validRecords: result.summary?.validRecords || 0,
      duplicateRecords: result.summary?.duplicateRecords || 0,
      opcus: opcus || 'NOT_PROVIDED'
    })
    
    return result
    
  } catch (error) {
    logError('❌ Error extracting data from Excel with 3-field duplicate check', error)
    return {
      success: false,
      errors: [`เกิดข้อผิดพลาดในการสกัดข้อมูล: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}