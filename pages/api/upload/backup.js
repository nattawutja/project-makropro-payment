//import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    //const user = await requireAuth(req); // ส่ง req ไปเช็ค auth
    // ทำงานกับ request method ต่างๆ ได้ เช่น
    if (req.method === 'POST') {
      // ประมวลผล POST
      res.status(200).json({ message: "Hello from API" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}