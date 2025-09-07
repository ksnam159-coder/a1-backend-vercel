// File: api/score.js

import { kv } from '@vercel/kv';

// Vercel sẽ tự động gọi hàm handler này khi có request đến /api/score
export default async function handler(req, res) {
    // Chỉ chấp nhận phương thức POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Phương thức không được phép.' });
    }

    try {
        const { name, avatar, xpGained } = req.body;

        if (!name || !avatar || xpGained === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
        }

        // Lấy danh sách điểm hiện tại từ database KV
        let scores = await kv.get('leaderboard') || [];

        const userIndex = scores.findIndex(user => user.name === name);

        if (userIndex !== -1) {
            // Nếu người dùng đã tồn tại, cộng dồn điểm XP
            scores[userIndex].xp += xpGained;
            scores[userIndex].avatar = avatar; // Cập nhật avatar mới nhất
        } else {
            // Nếu là người dùng mới, thêm vào danh sách
            scores.push({ name, avatar, xp: xpGained });
        }

        // Lưu lại danh sách đã cập nhật vào database KV
        await kv.set('leaderboard', scores);
        
        res.status(200).json({ message: 'Cập nhật điểm thành công!' });

    } catch (error) {
        console.error('Lỗi khi cập nhật điểm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
}