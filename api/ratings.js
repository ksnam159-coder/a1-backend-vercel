import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // --- PHẦN CẤU HÌNH CORS (Giữ nguyên) ---
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- BẮT ĐẦU PHẦN LOGIC MỚI ---

  // XỬ LÝ KHI LẤY ĐÁNH GIÁ TRUNG BÌNH (GET)
  if (req.method === 'GET') {
    try {
      // Lấy category từ query URL (ví dụ: ?category=A1)
      const category = req.query.category || 'A1'; // Mặc định là A1 nếu không có

      // Tạo ra các key riêng biệt dựa trên category
      const keys = [
        `${category}:rating:1`, 
        `${category}:rating:2`, 
        `${category}:rating:3`, 
        `${category}:rating:4`, 
        `${category}:rating:5`
      ];
      
      const counts = await kv.mget(...keys);

      let totalVotes = 0;
      let totalScore = 0;
      
      counts.forEach((count, index) => {
        const voteCount = count || 0;
        totalVotes += voteCount;
        totalScore += voteCount * (index + 1); 
      });

      const average = totalVotes > 0 ? (totalScore / totalVotes) : 0;

      return res.status(200).json({
        average: average,
        count: totalVotes,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Không thể lấy dữ liệu đánh giá.' });
    }
  }

  // XỬ LÝ KHI GỬI ĐÁNH GIÁ MỚI (POST)
  if (req.method === 'POST') {
    try {
      // Lấy cả rating và category từ body của request
      const { rating, category } = req.body;

      if (!rating || rating < 1 || rating > 5 || !category) {
        return res.status(400).json({ error: 'Đánh giá hoặc category không hợp lệ.' });
      }

      // Tạo key riêng biệt để tăng giá trị
      const key = `${category}:rating:${rating}`;
      await kv.incr(key);

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Không thể gửi đánh giá.' });
    }
  }

  return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
}