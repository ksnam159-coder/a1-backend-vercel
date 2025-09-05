// File: api/ratings.js (Phiên bản cho Render/Express)
const { createClient } = require('@supabase/supabase-js');

// Bạn sẽ cần thêm biến môi trường vào Render.com
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function handler(req, res) { // Đổi thành req, res
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase.from('ratings').select('score');
            if (error) throw error;

            if (!data || data.length === 0) {
                return res.status(200).json({ average: 0, count: 0 });
            }
            
            const allScores = data.map(item => item.score);
            const sum = allScores.reduce((acc, current) => acc + current, 0);
            const count = allScores.length;
            const average = sum / count;

            return res.status(200).json({ average, count });

        } catch (error) {
            console.error("Supabase GET Error:", error);
            return res.status(500).json({ message: 'Lỗi từ server' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { rating } = req.body; // Đổi thành req.body

            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Đánh giá không hợp lệ' });
            }

            const { error } = await supabase.from('ratings').insert({ score: rating });
            if (error) throw error;

            return res.status(201).json({ message: 'Đánh giá đã được ghi nhận' });

        } catch (error) {
            console.error("Supabase POST Error:", error);
            return res.status(500).json({ message: 'Lỗi từ server' });
        }
    }

    return res.status(405).send('Phương thức không được hỗ trợ');
}

module.exports = { default: handler };
//