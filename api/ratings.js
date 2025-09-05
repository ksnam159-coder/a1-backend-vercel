// File: api/ratings.js (Phiên bản dùng Supabase)
import { createClient } from '@supabase/supabase-js';

// Kết nối tới Supabase bằng biến môi trường
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(request) {
    if (request.method === 'GET') {
        try {
            // Lấy tất cả dữ liệu từ bảng 'ratings'
            const { data, error } = await supabase.from('ratings').select('score');
            if (error) throw error;

            if (!data || data.length === 0) {
                return new Response(JSON.stringify({ average: 0, count: 0 }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            const allScores = data.map(item => item.score);
            const sum = allScores.reduce((acc, current) => acc + current, 0);
            const count = allScores.length;
            const average = sum / count;

            return new Response(JSON.stringify({ average, count }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });

        } catch (error) {
            console.error("Supabase GET Error:", error);
            return new Response(JSON.stringify({ message: 'Lỗi từ server' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    if (request.method === 'POST') {
        try {
            const { rating } = await request.json();

            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                return new Response(JSON.stringify({ message: 'Đánh giá không hợp lệ' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 400,
                });
            }

            // Chèn một hàng mới vào bảng 'ratings'
            const { error } = await supabase.from('ratings').insert({ score: rating });
            if (error) throw error;

            return new Response(JSON.stringify({ message: 'Đánh giá đã được ghi nhận' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 201,
            });

        } catch (error) {
            console.error("Supabase POST Error:", error);
            return new Response(JSON.stringify({ message: 'Lỗi từ server' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    return new Response('Phương thức không được hỗ trợ', { status: 405 });
}
//thu nghiem