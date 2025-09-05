// File: /api/questions.js

import path from 'path';
import { promises as fs } from 'fs';

// Hàm xáo trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Hàm lấy ngẫu nhiên 'n' phần tử từ một mảng
function getRandomItems(arr, n) {
    return shuffleArray([...arr]).slice(0, n);
}

export default async function handler(request, response) {
    // Headers cho phép VPS của bạn gọi API
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const jsonDirectory = path.join(process.cwd(), 'api');
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'all_questions.json'), 'utf8');
        const allQuestions = JSON.parse(fileContents);

        // Kiểm tra xem có yêu cầu lấy TẤT CẢ câu hỏi không
        const { all } = request.query;
        if (all === 'true') {
            // Nếu có, trả về toàn bộ 250 câu
            response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
            return response.status(200).json(allQuestions);
        }

        // Nếu không, tạo một bộ đề ngẫu nhiên theo cấu trúc
        const categories = {
            khai_niem_va_quy_tac: allQuestions.filter(q => q.category === 'khai_niem_va_quy_tac' && !q.isThrottlingQuestion),
            diem_liet: allQuestions.filter(q => q.isThrottlingQuestion === true),
            van_hoa_giao_thong: allQuestions.filter(q => q.category === 'van_hoa_giao_thong'),
            ky_thuat_lai_xe: allQuestions.filter(q => q.category === 'ky_thuat_lai_xe'),
            bien_bao: allQuestions.filter(q => q.category === 'bien_bao'),
            sa_hinh: allQuestions.filter(q => q.category === 'sa_hinh')
        };
        
        const finalTestSet = [
            ...getRandomItems(categories.khai_niem_va_quy_tac, 8),
            ...getRandomItems(categories.diem_liet, 1),
            ...getRandomItems(categories.van_hoa_giao_thong, 1),
            ...getRandomItems(categories.ky_thuat_lai_xe, 1),
            ...getRandomItems(categories.bien_bao, 8),
            ...getRandomItems(categories.sa_hinh, 6)
        ];

        const finalShuffledTest = shuffleArray(finalTestSet);

        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return response.status(200).json(finalShuffledTest);

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Lỗi khi xử lý yêu cầu.' });
    }
}