// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มการ seed ข้อมูล...')

  try {
    // ลบข้อมูลเก่า (ถ้าต้องการ)
    console.log('🧹 ทำความสะอาดข้อมูลเก่า...')
    await prisma.user.deleteMany()
    
    // สร้าง Users
    console.log('👥 สร้างผู้ใช้งาน...')
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('1234', 12)
    const userPassword = await bcrypt.hash('user123', 12)
    const mayPassword = await bcrypt.hash('may123', 12)
    const waiwaiPassword = await bcrypt.hash('waiwai123', 12)
    const sudaPassword = await bcrypt.hash('suda123', 12)
    
    // สร้าง Admin User
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: adminPassword,
        email: 'admin@lazada-payment.com',
        firstName: 'Administrator',
        lastName: 'System',
        role: 'admin',
        isActive: true
      }
    })
    console.log('✅ สร้าง Admin User:', adminUser.username)

    // สร้าง Regular User
    const regularMay = await prisma.user.create({
      data: {
        username: 'may',
        password: mayPassword,
        email: 'may@lazada-payment.com',
        firstName: 'May',
        lastName: 'User',
        role: 'user',
        isActive: true
      }
    })
    console.log('✅ สร้าง Regular User:', regularMay.username)

    // สร้าง Regular User
    const regularUser = await prisma.user.create({
      data: {
        username: 'user',
        password: userPassword,
        email: 'user@lazada-payment.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        isActive: true
      }
    })
    console.log('✅ สร้าง Regular User:', regularUser.username)

    // สร้าง WAIWAI Store User
    const waiwaiUser = await prisma.user.create({
      data: {
        username: 'waiwai',
        password: waiwaiPassword,
        email: 'waiwai@lazada-payment.com',
        firstName: 'ไวไว',
        lastName: 'Store',
        role: 'store_waiwai',
        isActive: true
      }
    })
    console.log('✅ สร้าง WAIWAI Store User:', waiwaiUser.username)

    // สร้าง SERDA Store User
    const sudaUser = await prisma.user.create({
      data: {
        username: 'suda',
        password: sudaPassword,
        email: 'suda@lazada-payment.com',
        firstName: 'ซือดะ',
        lastName: 'Store',
        role: 'store_suda',
        isActive: true
      }
    })
    console.log('✅ สร้าง SERDA Store User:', sudaUser.username)

    // สร้าง Demo Users เพิ่มเติม
    const demoManager = await prisma.user.create({
      data: {
        username: 'manager',
        password: await bcrypt.hash('manager123', 12),
        email: 'manager@lazada-payment.com',
        firstName: 'Manager',
        lastName: 'Demo',
        role: 'manager',
        isActive: true
      }
    })
    console.log('✅ สร้าง Manager User:', demoManager.username)

    // สร้าง Inactive User สำหรับทดสอบ
    const inactiveUser = await prisma.user.create({
      data: {
        username: 'inactive',
        password: await bcrypt.hash('inactive123', 12),
        email: 'inactive@lazada-payment.com',
        firstName: 'Inactive',
        lastName: 'User',
        role: 'user',
        isActive: false
      }
    })
    console.log('✅ สร้าง Inactive User:', inactiveUser.username)

    // สร้าง Sample Process Logs
    console.log('📝 สร้าง Process Logs ตัวอย่าง...')
    
    await prisma.processLog.createMany({
      data: [
        {
          action: 'SYSTEM_INIT',
          status: 'SUCCESS',
          message: 'ระบบเริ่มทำงาน',
          details: { version: '1.0.0', environment: 'development' },
          userId: adminUser.id
        },
        {
          action: 'USER_SEED',
          status: 'SUCCESS',
          message: 'Seed ข้อมูลผู้ใช้สำเร็จ',
          details: { totalUsers: 6 },
          userId: adminUser.id
        }
      ]
    })

    console.log('📊 สร้างสถิติเริ่มต้น...')
    
    // สรุปข้อมูลที่สร้าง
    const userCount = await prisma.user.count()
    const activeUserCount = await prisma.user.count({ where: { isActive: true } })
    
    console.log('\n🎉 Seed ข้อมูลเสร็จสิ้น!')
    console.log('=' .repeat(50))
    console.log(`👥 ผู้ใช้งานทั้งหมด: ${userCount}`)
    console.log(`✅ ผู้ใช้งานที่ใช้งานได้: ${activeUserCount}`)
    console.log('=' .repeat(50))
    
    console.log('\n🔐 ข้อมูลการเข้าสู่ระบบ:')
    console.log('┌─────────────┬─────────────┬─────────────────┐')
    console.log('│ Username    │ Password    │ Role            │')
    console.log('├─────────────┼─────────────┼─────────────────┤')
    console.log('│ admin       │ 1234        │ admin           │')
    console.log('│ user        │ user123     │ user            │')
    console.log('│ may         │ may123      │ user            │')
    console.log('│ waiwai      │ waiwai123   │ store_waiwai    │')
    console.log('│ suda        │ suda123     │ store_suda      │')
    console.log('│ manager     │ manager123  │ manager         │')
    console.log('│ inactive    │ inactive123 │ user (inactive) │')
    console.log('└─────────────┴─────────────┴─────────────────┘')
    
    console.log('\n📋 ขั้นตอนถัดไป:')
    console.log('1. รันระบบ: npm run dev')
    console.log('2. เข้าสู่ระบบด้วย admin/1234')
    console.log('3. ทดสอบอัพโหลดไฟล์')
    console.log('4. ทดสอบการโอนเข้า AS400')

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ seed ข้อมูล:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('\n🔌 ปิดการเชื่อมต่อฐานข้อมูลแล้ว')
  })