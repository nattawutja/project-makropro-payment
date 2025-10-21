import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../lib/auth'
import formidable from 'formidable';
import * as XLSX from 'xlsx'

export const config = {
  api: {
    bodyParser: false, // ต้องปิด bodyParser เพื่อให้รับ FormData
  },
}

export default async function exportData(req, res) {

  const form = formidable();

  form.parse(req, async (err, fields, files) => {

    try {
      const cvData = JSON.parse(fields.data);

      const headerMap = {
        Oseq: 'ลำดับ',
        opbil: 'Order No.',
        opcus: 'รหัส',
        ocom1: 'ค่าคอม',
        ocom2: 'Vat ค่าคอม',
        obamt: 'ยอดในบิล',
        opmdt: 'วันที่โอนเงิน',
        ortna: 'คำสั่งซื้อที่คืนให้ลูกค้า',
        oscam: 'ค่าคอม คำสั่งซื้อที่คืนเงิน',
        otamt: 'ค่าคอม + Vat ค่าคอม',
        otdte: 'วันที่โอน',
        otime: 'เวลาที่โอน',
        otram: 'ยอดเงินที่ได้รับจริง'
      };

      const columnOrder = [
        'Oseq',
        'opbil',
        'opcus',
        'ocom1',
        'ocom2',
        'obamt',
        'opmdt',
        'ortna',
        'oscam',
        'otamt',
        'otdte',
        'otime',
        'otram'
      ];

      const newData = cvData.map(item => {
        const obj = {};
        columnOrder.forEach(key => {
          obj[headerMap[key] || key] = item[key];
        });
        return obj;
      });

      const ws = XLSX.utils.json_to_sheet(newData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ExportData');

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      res.setHeader('Content-Disposition', 'attachment; filename="export_data.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(buffer);

    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Something went wrong', detail: error.message });
    }


  });
  
}
