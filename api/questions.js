// File: /api/questions.js (đã được sửa đổi)

import path from 'path';
import { promises as fs } from 'fs';

// Hàm xáo trộn mảng
function shuffleArray(array) {
    // ... (Không thay đổi)
}

// Hàm lấy ngẫu nhiên 'n' phần tử từ một mảng
function getRandomItems(arr, n) {
    // ... (Không thay đổi)
}

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const jsonDirectory = path.join(process.cwd(), 'api');
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'all_questions.json'), 'utf8');
        const allQuestions = JSON.parse(fileContents);

        // Lọc bỏ đáp án trước khi trả về
        const sanitizedQuestions = allQuestions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
        });

        // Kiểm tra xem có yêu cầu lấy TẤT CẢ câu hỏi không
        const { all } = request.query;
        if (all === 'true') {
            response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
            return response.status(200).json(sanitizedQuestions);
        }

        // Tạo một bộ đề ngẫu nhiên theo cấu trúc
        const categories = {
            khai_niem_va_quy_tac: sanitizedQuestions.filter(q => q.category === 'khai_niem_va_quy_tac' && !q.isThrottlingQuestion),
            diem_liet: sanitizedQuestions.filter(q => q.isThrottlingQuestion === true),
            // ... (các categories khác)
        };
        
        const finalTestSet = [
            // ... (lấy các câu hỏi ngẫu nhiên từ categories)
        ];

        const finalShuffledTest = shuffleArray(finalTestSet);

        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return response.status(200).json(finalShuffledTest);

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Lỗi khi xử lý yêu cầu.' });
    }
}