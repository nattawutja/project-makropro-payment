import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable';
import odbc from 'odbc';

const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');

const formattedDate = `${year}${month}${day}`;

export const config = {
  api: {
    bodyParser: false, // ต้องปิด bodyParser เพื่อให้รับ FormData
  },
}

export default async function handler(req, res) {

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, JWT_SECRET);

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    const cvData = JSON.parse(fields.data);
    const countData = cvData.length;
    const AS400_CONFIG = {
      dsn: process.env.AS400_DSN,
      uid: process.env.AS400_UID,
      pwd: process.env.AS400_PWD,
      library: process.env.AS400_LIBRARY,
      file: 'PMONHP',
      encoding: '1208',
      connectionTimeout: 30000,
      queryTimeout: 60000,
    }

    let connection;

    try {
      const user_id = decoded.id;
      const user = await prisma.UserMakroPro.findFirst({
        where: {
          user_id,
        },
      });

      if(user){
        connection = await odbc.connect(`DSN=${AS400_CONFIG.dsn};UID=${AS400_CONFIG.uid};PWD=${AS400_CONFIG.pwd};`);
        const duplicateData = [];
        let insertedCount = 0
        for(let i = 0;i < countData; i++){
          const sql = `SELECT OSEQ, OPCUS, OPBIL, OPMDT, OTRAM, OBAMT FROM ${AS400_CONFIG.library}.${AS400_CONFIG.file} WHERE OPBIL = ? FETCH FIRST 1 ROWS ONLY`;
          const result = await connection.query(sql, [cvData[i].opbil]);
        
          const insertSQL = `
          INSERT INTO ${AS400_CONFIG.library}.${AS400_CONFIG.file}
          (OSEQ, OPCUS, OPBIL, OPMDT, ORTNA, OSCAM, OSBAM, OSTAM, OSAAM, ORSAM, OSRAM, 
          OCOM1, OCOM2, OSERV, OTRANS, OTAMT, OTRAM, OBAMT, OTDTE, OTIME)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          if(result.length > 0){
            duplicateData.push(cvData[i]);
          }else{
            const record = cvData[i];
            await connection.query(insertSQL, [
              record.Oseq,
              record.opcus,
              record.opbil,
              formattedDate,
              record.ortna,
              record.oscam,
              0,
              0,
              0,
              0,
              0,
              record.ocom1,
              record.ocom2,
              0,
              0,
              record.otamt,
              record.otram,
              record.obamt,
              formattedDate,
              record.otime
            ])
            insertedCount++
          }
          
        }

        const statusAs400 = insertedCount > 0

        await prisma.makroProPayment.deleteMany();
        res.status(200).json({message: 'ไฟล์ส่งมาถึง backend แล้วจ้าาาาา',success: true,data:duplicateData,status400:statusAs400});
      }else{
        res.status(200).json({message: 'Token หมดอายุ หรือ ข้อมูลไม่ถูกต้อง',success: false});
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Something went wrong', detail: error.message });
    } finally {
      await connection.close();
      await prisma.$disconnect();
    }
  });
  
}
