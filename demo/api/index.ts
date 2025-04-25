
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TEST_EMAIL = 'johndoe@example.com';
const TEST_PASSWORD = 'password123';
const TEST_USER = {
	name: 'John Doe',
	email: TEST_EMAIL,
};

// Mock sign-in endpoint
app.post('/api/sign-in', (req, res) => {

	const {
		email,
		password
	} = req.body;

	if (!email || !password) {
		return res.status(400).json({
			error: 'Missing email or password'
		});
	};

	if (email !== TEST_EMAIL || password !== TEST_PASSWORD) {
		return res.status(401).json({
			error: 'Invalid email or password'
		});
	}

	return res.json({
		token: `Bearer faketoken-${Date.now()}`
	});
});

// Mock profile endpoint
app.get('/api/profile', (req, res) => {
	const auth = req.headers['authorization'];
	if (!auth) {
		return res.status(401).json({
			error: 'Unauthorized'
		});
	}
	if (!auth.startsWith('Bearer')) {
		return res.status(401).json({
			error: 'Invalid token format'
		});
	}
	return res.json(TEST_USER);
});

app.listen(PORT, () => {
	console.log(`✅ API listening at http://localhost:${PORT}`);
});
