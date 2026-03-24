const OpenAI = require('openai');
const Expense = require('../models/Expense');

let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// @desc    Get AI Spending Insights
// @route   GET /api/ai/insights
// @access  Private
exports.getInsights = async (req, res) => {
    try {
        if (!openai) {
            return res.status(200).json({
                success: true,
                data: "AI is not configured. Please add OPENAI_API_KEY to your .env file."
            });
        }

        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const expenses = await Expense.find({
            user: req.user.id,
            date: { $gte: firstDay, $lte: lastDay }
        });

        if (expenses.length === 0) {
            return res.status(200).json({
                success: true,
                data: "You haven't added any expenses this month. Start adding some to get AI insights!"
            });
        }

        const expenseData = expenses.map(e => `${e.amount} INR for ${e.category} on ${e.date.toISOString().split('T')[0]}`).join('\n');

        const prompt = `Analyze these expenses and provide a very brief (2-3 sentences max) financial insight predicting future expenses, detecting overspending trends, and suggesting category-wise budget limits based on the spending behavior:\n${expenseData}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        });

        res.status(200).json({
            success: true,
            data: completion.choices[0].message.content
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'AI Service Error' });
    }
};

// @desc    Parse SMS to Expense Data
// @route   POST /api/ai/parse-sms
exports.parseSms = async (req, res) => {
    try {
        const { smsText } = req.body;

        if (!smsText) {
            return res.status(400).json({ success: false, error: "Please provide SMS text." });
        }

        if (!openai) {
            // Fallback basic text parser if AI is missing
            const amountMatch = smsText.match(/(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
            return res.status(200).json({
                success: true,
                data: {
                    amount,
                    category: 'Others',
                    date: new Date().toISOString().split('T')[0],
                    notes: 'SMS Extracted',
                    isRecurring: false
                }
            });
        }

        const prompt = `Extract standard expense details from this bank SMS transaction. Return ONLY a valid JSON object with these exact keys: amount (number), category (string: Food, Travel, Books, Shopping, or Others), date (YYYY-MM-DD), notes (string merchant name) and isRecurring (boolean).\n\nSMS: "${smsText}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        });

        let resultObj = JSON.parse(completion.choices[0].message.content.replace(/```json/g, "").replace(/```/g, ""));

        res.status(200).json({
            success: true,
            data: resultObj
        });

    } catch (err) {
        res.status(500).json({ success: false, error: 'AI Service Error' });
    }
};
