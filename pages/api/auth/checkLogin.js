import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const jwt = require('jsonwebtoken');

export const config = {
  api: {
    bodyParser: false, // ต้องปิด bodyParser เพื่อให้รับ FormData
  },
}

export default async function checkLogin(req, res) {

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    const cvData = fields;
    const username = cvData.username;
    const password = cvData.password;
    console.log(cvData,"<---------cvData");
    try {
      await prisma.$connect();
      const user = await prisma.UserMakroPro.findFirst({
        where: {
          username,
          password,
        },
      });

      if(user){
        const payload = {
          id: user.user_id,
          username: user.fullName,
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
        res.status(200).json({message: 'ไฟล์ส่งมาถึง backend แล้วจ้าาาาา',success: true,data:user.user_id,fullName:user.fullName,tokenData:token});
      }else{
        res.status(200).json({message: 'ชื่อหรือรหัสผ่านไม่ถูกต้อง',success: false,data:cvData});
      }
     

    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Something went wrong', detail: error.message });
    } finally {
      await prisma.$disconnect();
    }
  });
  
}
