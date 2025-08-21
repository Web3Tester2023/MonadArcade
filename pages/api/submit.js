import clientPromise from '../../lib/db';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Secure the endpoint using NextAuth.js JWT token
    const token = await getToken({ req });
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("web3-arcade");
        const { gameId, score } = req.body;

        // Basic validation
        if (!gameId || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid data provided.' });
        }

        const scoreData = {
            userId: token.sub, // 'sub' is the standard JWT claim for subject (user ID)
            walletAddress: token.wallet?.address || 'N/A',
            gameId,
            score,
            timestamp: new Date(),
        };

        const result = await db.collection('scores').insertOne(scoreData);

        res.status(201).json({ success: true, scoreId: result.insertedId });
    } catch (error) {
        console.error("Failed to submit score:", error);
        res.status(500).json({ error: 'Internal Server Error: Failed to submit score.' });
    }
}
