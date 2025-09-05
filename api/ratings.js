// File: api/ratings.js

import { kv } from '@vercel/kv';

// Cấu hình CORS để cho phép trang web của bạn gọi API này
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Hoặc thay '*' bằng domain của bạn để an toàn hơn
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request) {
    // Trả về headers cho các request OPTIONS (trình duyệt gửi để kiểm tra CORS)
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // --- XỬ LÝ KHI NGƯỜI DÙNG TẢI TRANG (GET) ---
    if (request.method === 'GET') {
        try {
            const allRatings = await kv.lrange('ratings', 0, -1);
            
            if (!allRatings || allRatings.length === 0) {
                const data = { average: 0, count: 0 };
                return new Response(JSON.stringify(data), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            const sum = allRatings.reduce((a, b) => a + b, 0);
            const average = sum / allRatings.length;
            const count = allRatings.length;

            const data = { average, count };
            return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({ message: 'Lỗi từ server' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    // --- XỬ LÝ KHI NGƯỜI DÙNG GỬI ĐÁNH GIÁ (POST) ---
    if (request.method === 'POST') {
        try {
            const { rating } = await request.json();

            // Kiểm tra dữ liệu đầu vào
            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                return new Response(JSON.stringify({ message: 'Đánh giá không hợp lệ' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400, // Bad Request
                });
            }

            await kv.lpush('ratings', rating);

            return new Response(JSON.stringify({ message: 'Đánh giá đã được ghi nhận' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 201, // Created
            });

        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({ message: 'Lỗi từ server' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    // Nếu không phải GET hoặc POST
    return new Response('Phương thức không được hỗ trợ', { status: 405 });
}