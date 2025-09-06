import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // --- BẮT ĐẦU PHẦN CẤU HÌNH CORS ---
  // Thiết lập header để cho phép các trang web khác gọi vào API này
  // Thay '*' bằng địa chỉ web chính thức của bạn khi deploy để an toàn hơn
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Vercel yêu cầu phải xử lý riêng request OPTIONS cho CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- KẾT THÚC PHẦN CẤU HÌNH CORS ---


  // XỬ LÝ KHI NGƯỜI DÙNG LẤY ĐÁNH GIÁ TRUNG BÌNH (GET)
  if (req.method === 'GET') {
    try {
      const keys = ['rating:1', 'rating:2', 'rating:3', 'rating:4', 'rating:5'];
      // Lấy giá trị của nhiều key cùng một lúc
      const counts = await kv.mget(...keys);

      let totalVotes = 0;
      let totalScore = 0;

      // counts sẽ là một mảng [count1, count2, count3, count4, count5]
      counts.forEach((count, index) => {
        const voteCount = count || 0; // Nếu key không tồn tại, giá trị là null, ta coi là 0
        totalVotes += voteCount;
        // index là 0, 1, 2, 3, 4 tương ứng với 1, 2, 3, 4, 5 sao
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

  // XỬ LÝ KHI NGƯỜI DÙNG GỬI ĐÁNH GIÁ MỚI (POST)
  if (req.method === 'POST') {
    try {
      const { rating } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Đánh giá không hợp lệ.' });
      }

      // Tăng số lượt đếm cho đánh giá tương ứng (ví dụ: 'rating:5')
      const key = `rating:${rating}`;
      await kv.incr(key);

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Không thể gửi đánh giá.' });
    }
  }

  // Nếu không phải GET, POST, OPTIONS thì báo lỗi
  return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
}