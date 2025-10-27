import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    await prisma.makroProPayment.deleteMany();
    res.status(200).json({message: 'ไฟล์ส่งมาถึง backend แล้วจ้าาาาา',success: true});
    
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Something went wrong', detail: error.message });
  } finally {
    await prisma.$disconnect();
  }
  
}
