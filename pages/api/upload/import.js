import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable';
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'


const parseExcelDate = (str) => {
  const [datePart, timePart] = str.split(' - ');
  const [day, month, year] = datePart.split('/');
  const isoString = `${year}-${month}-${day}T${timePart}`;
  return new Date(isoString);
}

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

      const file = files.file[0]
      const filePath = file.filepath
      const fileName = file.originalFilename
      const fileSize = (file.size / (1024 * 1024)).toFixed(2)
      const ext = path.extname(fileName).toLowerCase();
      const maxSizeFile = 10 * 1024 * 1024;

      if(ext != ".xlsx" && ext != ".xls"){
        return res.status(400).json({
          message: 'ไฟล์ไม่ถูกต้อง! กรุณาอัปโหลด .xls หรือ .xlsx',
          success: false
        });
      }

      try {
        await prisma.$connect();

        const user_id = decoded.id;
        const user = await prisma.UserMakroPro.findFirst({
          where: {
            user_id,
          },
        });

        if(user){
          const fileBuffer = fs.readFileSync(file.filepath);
          const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
          const sheet = workbook.SheetNames[0];
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

          data.forEach(row => {

            //console.log(Object.keys(row));
            const shipping_address_street_1 = row['Shippingaddressstreet 1'] ? String(row['Shippingaddressstreet 1']).trim().replace(/\u00A0/g, '') : null;
            const shipping_address_street_2 = row['Shippingaddressstreet 2'] ? String(row['Shippingaddressstreet 2']).trim().replace(/\u00A0/g, '') : null;
            const Billing_address_street_1 = row['Billing address street 1'] ? String(row['Billing address street 1']).trim().replace(/\u00A0/g, '') : null;
            const Billing_address_street_2 = row['Billing address street 2'] ? String(row['Billing address street 2']).trim().replace(/\u00A0/g, '') : null;
            const offerSKU = row['Offer SKU'] ? String(row['Offer SKU']).trim().replace(/\u00A0/g, '') : null;
            
            row.Shippingaddressstreet1 = shipping_address_street_1;
            row.Shippingaddressstreet2 = shipping_address_street_2;
            row.Billingaddressstreet1 = Billing_address_street_1;
            row.Billingaddressstreet2 = Billing_address_street_2;
            row.offerSKU = offerSKU;
          })


          const dataToInsert = data.map(row => ({
            Docno: row["เลขที่ใบแจ้งหนี้"] ?? null,
            OrderNo: row["Order number"] ?? null,
            create_date: row["Date created"] ? parseExcelDate(row["Date created"]) : null,
            statusOrder: row["สถานะของคำสั่งซื้อ"] ?? null,
            Subtotal_incl_tax: row["ยอดรวมย่อยของสินค้า (รวมภาษี)"] ?? null,
            Shipping_cost_incl_tax: row["ค่าจัดส่ง (รวมภาษี)"] ?? 0,
            total_amount_incl_tax: row["ราคารวมสุทธิ (รวมภาษี)"] ?? null,
            Commission: row["Commission (excluding taxes)"] ?? null,
            Tax_commission: row["ภาษีคิดจากค่าคอมมิชชั่น"] ?? null,
            Amount_transfer: row["สถานะของคำสั่งซื้อ"] == "คืนเงินไปแล้ว" ? 0 : row["Amount transferred to ร้าน (including taxes)"] ?? null ,
            qty: row["Quantity"] ?? null,
            Product_name: row["สินค้า"] ?? null,
            product_SKU: row["Product SKU"] ?? null,
            approve_date_payment: row["วันที่ยืนยันการชำระเงิน"] ? parseExcelDate(row["วันที่ยืนยันการชำระเงิน"]) : null,
            Shipping_method: row["Shipping method"] ?? null,
            Shipping_address_first_name: row["Shipping address first name"] ?? null,
            Shipping_address_last_name: row["Shipping address last name"] ?? null,
            Shipping_address_company: row["Shipping address company"] ?? null,

            Shipping_address_street_1: row["Shippingaddressstreet1"] ?? null,
            Shipping_address_street_2: row["Shippingaddressstreet2"] ?? null,
            Additional_address_info: row["ข้อมูลเสริมของที่อยู่ในการจัดส่ง"] ?? null,
            Shipping_address_zip: row["Shipping address zip"].toString() ?? null,


            Shipping_address_city: row["Shipping address city"] ?? null,
            Shipping_address_state: row["Shipping address state"] ?? null,
            Shipping_address_country: row["Shipping address country"] ?? null,
            Billing_address_first_name: row["Billing address first name"] ?? null,
            Billing_address_last_name: row["Billing address last name"] ?? null,
            Billing_address_company: row["Billing address company"] ?? null,

            Billing_address_street_1: row["Billingaddressstreet1"] ?? null,
            Billing_address_street_2: row["Billingaddressstreet2"] ?? null,

            Additional_billing_address_info: row["ข้อมูลเสริมของที่อยู่ในการออกใบแจ้งหนี้"] ?? null,
            Billing_address_zip: row["Billing address zip"].toString() ?? null,
            Billing_address_city: row["Billing address city"] ?? null,
            Billing_address_state: row["Billing address state"] ?? null ,
            Billing_address_country: row["Billing address country"] ?? null,

            Product_subtotal_dont_know_tax: row["ยอดรวมย่อยของสินค้า (ไม่รู้ภาษี)"] ?? null,
            Tax_product: row["ภาษีสินค้า"] ?? 0,
            Shipping_excluding_tax: row["ค่าจัดส่ง (ไม่รวมภาษี)"] ?? 0,
            Tax_shipping: row["ภาษีค่าจัดส่ง"] ?? 0,
            Total_excluding_tax: row["ราคารวมสุทธิ (ไม่รวมภาษี)"] ?? null,
            Tax_calculated_on_net_total: row["ภาษีคิดจากราคารวมสุทธิ"] ?? 0,
            Currency: row["Currency"] ?? null,
            Offer_SKU: row["offerSKU"] ?? null
          }));

          await prisma.makroProPayment.createMany({
            data: dataToInsert
          });

          //console.log(dataToInsert.length,"<-------------dataToInsert.length");
          await prisma.LogUserMkPro.create({
            data: {
              // ฟิลด์ที่ต้องการเพิ่ม
              user_id: decoded.id,
              totalFile: dataToInsert.length
            }
          });

          const result = await prisma.$queryRaw`
            WITH cte AS (
              SELECT 
                "OrderNo",
                SUM("Subtotal_incl_tax" - "Amount_transfer" - "Commission") AS "ocom2tmp"
              FROM "makroPro_Payment"
              GROUP BY "OrderNo", "statusOrder", "create_date"
            ),
            totaldt AS (
              SELECT 
                t1."OrderNo" AS "opbil",
                '989905' AS "opcus",
                to_char(t1."create_date",'YYYYMMDD') AS "opmdt",
                SUM(t1."Subtotal_incl_tax") AS "obamt",
                SUM(t1."Commission") AS "ocom1",
                SUM(t1."Subtotal_incl_tax" - "Amount_transfer" - "Commission") AS "ocom2",
                SUM(CASE WHEN t1."statusOrder" = 'คืนเงินไปแล้ว' THEN t1."Subtotal_incl_tax" ELSE 0 END) AS "ortna",
                SUM(CASE WHEN t1."statusOrder" = 'คืนเงินไปแล้ว' THEN t1."Commission" + t2."ocom2tmp" ELSE 0 END) AS "oscam",
                SUM(t1."Amount_transfer") AS "otram",
                SUM(t1."Commission" + t2."ocom2tmp") AS "otamt",
                to_char(t1."create_date",'YYYYMMDD') AS "otdte",
                to_char(t1."create_date",'HHmmss') AS "otime"
              FROM "makroPro_Payment" t1
              LEFT JOIN cte t2 ON t1."OrderNo" = t2."OrderNo"
              GROUP BY t1."OrderNo", "statusOrder", "create_date"
            ),
            finaldt AS (
              SELECT *,ROW_NUMBER() OVER (ORDER BY "opbil") AS "Oseq"
              FROM totaldt
            )
            SELECT * FROM finaldt;
          `;


          const resultSendData = await prisma.$queryRaw`
            WITH cte AS (
              SELECT 
                "OrderNo",
                SUM("Subtotal_incl_tax" - "Amount_transfer" - "Commission") AS "ocom2tmp"
              FROM "makroPro_Payment"
              GROUP BY "OrderNo", "statusOrder", "create_date"
            ),
            totaldt AS (
              SELECT 
                SUBSTRING(t1."OrderNo" FROM 6) AS "opbil",
                '989905' AS "opcus",
                to_char(t1."create_date",'YYYYMMDD') AS "opmdt",
                SUM(t1."Subtotal_incl_tax") AS "obamt",
                SUM(t1."Commission") AS "ocom1",
                SUM(t1."Subtotal_incl_tax" - "Amount_transfer" - "Commission") AS "ocom2",
                SUM(CASE WHEN t1."statusOrder" = 'คืนเงินไปแล้ว' THEN t1."Subtotal_incl_tax" ELSE 0 END) AS "ortna",
                SUM(CASE WHEN t1."statusOrder" = 'คืนเงินไปแล้ว' THEN t1."Commission" + t2."ocom2tmp" ELSE 0 END) AS "oscam",
                SUM(t1."Amount_transfer") AS "otram",
                SUM(t1."Commission" + t2."ocom2tmp") AS "otamt",
                to_char(t1."create_date",'YYYYMMDD') AS "otdte",
                to_char(t1."create_date",'HHmmss') AS "otime"
              FROM "makroPro_Payment" t1
              LEFT JOIN cte t2 ON t1."OrderNo" = t2."OrderNo"
              GROUP BY t1."OrderNo", "statusOrder", "create_date"
            ),
            finaldt AS (
              SELECT *,ROW_NUMBER() OVER (ORDER BY "opbil") AS "Oseq"
              FROM totaldt
            )
            SELECT * FROM finaldt;
          `;

          const resultAfterImport = await prisma.$queryRaw`
          SELECT count("OrderNo") as countdata,
          ROUND(SUM("Subtotal_incl_tax") FILTER (WHERE "statusOrder" = 'ปิดแล้ว')::numeric, 2) AS "statusOrderClose",
          ROUND(SUM("Subtotal_incl_tax") FILTER (WHERE "statusOrder" = 'คืนเงินไปแล้ว')::numeric, 2) AS "statusOrderRefund",
          ROUND(SUM("Amount_transfer")::numeric, 2) AS "Total",
          ROUND(SUM("Subtotal_incl_tax")::numeric, 2) AS "SubTotal"
          FROM "makroPro_Payment";
          `;

          const resultShowDataTable = await prisma.$queryRaw`
            WITH cte AS (
              SELECT 
                "OrderNo",
                ROUND(SUM("Subtotal_incl_tax" - "Amount_transfer" - "Commission")::numeric,2) AS "ocom2tmp"
              FROM "makroPro_Payment"
              GROUP BY "OrderNo", "statusOrder", "create_date"
            ),
            totaldt AS (
              SELECT 
                SUBSTRING(t1."OrderNo" FROM 6) AS "opbil",
                '989905' AS "opcus",
                to_char(t1."create_date",'YYYYMMDD') AS "opmdt",
                ROUND(SUM(t1."Subtotal_incl_tax")::numeric,2) AS "obamt",
                ROUND(SUM(t1."Commission")::numeric,2) AS "ocom1",
                ROUND(SUM(t1."Commission" * "Tax_commission" / 100)::numeric,2) AS "ocom2",
                ROUND(SUM(CASE WHEN t1."statusOrder" = 'คืนเงินไปแล้ว' THEN t1."Subtotal_incl_tax" ELSE 0 END)::numeric,2) AS "ortna",
                ROUND(SUM(CASE WHEN t1."statusOrder" = 'คืนเงินไปแล้ว' THEN t1."Commission" + t2."ocom2tmp" ELSE 0 END)::numeric,2) AS "oscam",
                ROUND(SUM(t1."Amount_transfer")::numeric,2) AS "otram",
                ROUND(SUM(t1."Commission" + t2."ocom2tmp")::numeric,2) AS "otamt",
                to_char(t1."create_date",'YYYYMMDD') AS "otdte",
                to_char(t1."create_date",'HHmmss') AS "otime"
              FROM "makroPro_Payment" t1
              LEFT JOIN cte t2 ON t1."OrderNo" = t2."OrderNo"
              GROUP BY t1."OrderNo", "statusOrder", "create_date"
            ),
            finaldt AS (
              SELECT *,ROW_NUMBER() OVER (ORDER BY "opbil") AS "Oseq"
              FROM totaldt
            )
            SELECT * FROM finaldt;
          `;

          const safeResult = result.map(row => {
            return Object.fromEntries(
              Object.entries(row).map(([k, v]) => {
                if (typeof v === 'bigint') return [k, v.toString()];
                return [k, v];
              })
            );
          });

          const safeResultSendData = resultSendData.map(row => {
            return Object.fromEntries(
              Object.entries(row).map(([k, v]) => {
                if (typeof v === 'bigint') return [k, v.toString()];
                return [k, v];
              })
            );
          });

          const safeResultAfterImport = resultAfterImport.map(row => {
            return Object.fromEntries(
              Object.entries(row).map(([k, v]) => {
                if (typeof v === 'bigint') return [k, v.toString()];
                return [k, v];
              })
            );
          });

          
          const safeResultShowTable = resultShowDataTable.map(row => {
            return Object.fromEntries(
              Object.entries(row).map(([k, v]) => {
                if (typeof v === 'bigint') return [k, v.toString()];
                return [k, v];
              })
            );
          });

          console.log(safeResultAfterImport,"<-------------safeResultAfterImport");
          fs.unlinkSync(file.filepath);

          res.status(200).json({message: 'ไฟล์ส่งมาถึง backend แล้วจ้าาาาา',success: true,data:safeResult,dataafterimport:safeResultAfterImport,dataSendas400:safeResultSendData,dataShowTable:safeResultShowTable});
        }else{
          res.status(200).json({message: 'อัพโหลดไม่สำเร็จ',success: false});
        }
       
      } catch (error) {
        console.error(error);  // log detail
        return res.status(400).json({ error: 'Something went wrong', detail: error.message });
      } finally {
        await prisma.$disconnect();
      }
    });
 
}
