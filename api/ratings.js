// File: api/ratings.js (Phiên bản đã dọn dẹp)

import { kv } from '@vercel/kv';

export default async function handler(request) {
    // --- XỬ LÝ KHI NGƯỜI DÙNG TẢI TRANG (GET) ---
    if (request.method === 'GET') {
        try {
            const allRatings = await kv.lrange('ratings', 0, -1);
            
            if (!allRatings || allRatings.length === 0) {
                const data = { average: 0, count: 0 };
                return new Response(JSON.stringify(data), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            const sum = allRatings.map(Number).reduce((acc, current) => acc + current, 0);
            const count = allRatings.length;
            const average = sum / count;

            const data = { average, count };
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });

        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({ message: 'Lỗi từ server' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    // --- XỬ LÝ KHI NGƯỜI DÙNG GỬI ĐÁNH GIÁ (POST) ---
    if (request.method === 'POST') {
        try {
            const { rating } = await request.json();

            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                return new Response(JSON.stringify({ message: 'Đánh giá không hợp lệ' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 400,
                });
            }

            await kv.lpush('ratings', rating);

            return new Response(JSON.stringify({ message: 'Đánh giá đã được ghi nhận' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 201,
            });

        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({ message: 'Lỗi từ server' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    return new Response('Phương thức không được hỗ trợ', { status: 405 });
}