import express from "express";
import axios from "axios";

const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;

let window = [];

// Middleware to fetch numbers from third-party API
const fetchNumber = async (req, res, next) => {
    const numberId = req.params.numberid;
    const validIds = ['p', 'f', 'e', 'r'];
    
    if (!validIds.includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    try {
        const response = await axios.get(`https://third-party-server.com/numbers/${numberId}`, { timeout: 500 });
        req.number = response.data.number;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch number' });
    }
};

app.get('/numbers/:numberid', fetchNumber, (req, res) => {
    const newNumber = req.number;
    const prevState = [...window];

    if (!window.includes(newNumber)) {
        if (window.length >= WINDOW_SIZE) {
            window.shift();
        }
        window.push(newNumber);
    }

    const avg = window.length ? window.reduce((sum, num) => sum + num, 0) / window.length : 0;

    res.json({
        windowPrevState: prevState,
        windowCurrState: window,
        numbers: [newNumber],
        avg: avg.toFixed(2)
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
