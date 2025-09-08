// File: /api/answer.js
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { questionId } = request.query;

    if (!questionId) {
        return response.status(400).json({ message: "Thiếu ID câu hỏi." });
    }

    try {
        const jsonDirectory = path.join(process.cwd(), 'api');
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'all_questions.json'), 'utf8');
        const allQuestions = JSON.parse(fileContents);

        const question = allQuestions.find(q => q.id === parseInt(questionId));

        if (!question) {
            return response.status(404).json({ message: "Không tìm thấy câu hỏi." });
        }

        // Trả về chỉ đáp án
        return response.status(200).json({ correctAnswer: question.correctAnswer });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Lỗi khi lấy đáp án.' });
    }
}