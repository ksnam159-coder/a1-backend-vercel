// File: api/leaderboard.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Đoạn code thêm header CORS thủ công đã được XÓA BỎ

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Phương thức không được phép.' });
    }
    
    try {
        const scores = await kv.get('leaderboard') || [];
        const sortedScores = scores.sort((a, b) => b.xp - a.xp);
        const top10 = sortedScores.slice(0, 10);
        res.status(200).json(top10);

    } catch (error) {
        console.error('Lỗi khi lấy bảng xếp hạng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
}
//thu nghiem