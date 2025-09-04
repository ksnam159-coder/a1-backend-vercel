// File: /api/questions.js

import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(request, response) {
    // --- Headers quan trọng cho phép VPS của bạn gọi API ---
    // Dấu * cho phép mọi trang web gọi. Để an toàn hơn, bạn có thể thay * bằng địa chỉ web trên VPS, ví dụ: 'https://trangwebcuaban.com'
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Vercel tự động xử lý các request OPTIONS, nên không cần thêm logic
    
    try {
        // Tìm đường dẫn chính xác đến thư mục 'api'
        const jsonDirectory = path.join(process.cwd(), 'api');
        
        // Đọc nội dung file JSON
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'all_questions.json'), 'utf8');
        
        // Chuyển nội dung text thành đối tượng JSON
        const allQuestions = JSON.parse(fileContents);
        
        // Thiết lập caching để tăng tốc
        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        
        // Trả về dữ liệu thành công
        return response.status(200).json(allQuestions);

    } catch (error) {
        // Nếu có lỗi, trả về thông báo lỗi
        console.error(error);
        return response.status(500).json({ message: 'Lỗi khi đọc dữ liệu câu hỏi.' });
    }
}