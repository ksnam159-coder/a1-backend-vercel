// File: api/score.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // --- BẮT ĐẦU CODE SỬA LỖI CORS ---
    // Cho phép tất cả các domain có thể gọi đến API này
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Trình duyệt sẽ gửi một yêu cầu OPTIONS trước yêu cầu POST thật sự
    // Chúng ta cần trả lời OK cho yêu cầu này.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // --- KẾT THÚC CODE SỬA LỖI CORS ---

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Phương thức không được phép.' });
    }

    try {
        const { name, avatar, xpGained } = req.body;

        if (!name || !avatar || xpGained === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
        }

        let scores = await kv.get('leaderboard') || [];
        const userIndex = scores.findIndex(user => user.name === name);

        if (userIndex !== -1) {
            scores[userIndex].xp += xpGained;
            scores[userIndex].avatar = avatar;
        } else {
            scores.push({ name, avatar, xp: xpGained });
        }

        await kv.set('leaderboard', scores);
        
        res.status(200).json({ message: 'Cập nhật điểm thành công!' });

    } catch (error) {
        console.error('Lỗi khi cập nhật điểm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
}