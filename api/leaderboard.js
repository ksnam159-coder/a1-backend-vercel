// File: api/leaderboard.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Chỉ chấp nhận phương thức GET
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Phương thức không được phép.' });
    }
    
    try {
        // Lấy danh sách điểm từ database KV
        const scores = await kv.get('leaderboard') || [];

        // Sắp xếp người dùng theo điểm XP từ cao đến thấp
        const sortedScores = scores.sort((a, b) => b.xp - a.xp);

        // Lấy top 10 người dùng đầu tiên
        const top10 = sortedScores.slice(0, 10);

        res.status(200).json(top10);

    } catch (error) {
        console.error('Lỗi khi lấy bảng xếp hạng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
}