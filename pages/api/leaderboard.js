import clientPromise from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("web3-arcade");
        const { gameId } = req.query;

        // Build the query object based on whether a gameId is provided
        const query = gameId ? { gameId } : {};

        const leaderboard = await db.collection('scores')
            .find(query)
            .sort({ score: -1 }) // Sort by score in descending order
            .limit(100) // Limit to the top 100 scores
            .toArray();
        
        // Ensure the response is JSON serializable
        const serializableLeaderboard = leaderboard.map(entry => ({
            ...entry,
            _id: entry._id.toString(), // Convert ObjectId to string
        }));

        res.status(200).json(serializableLeaderboard);
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        res.status(500).json({ error: 'Internal Server Error: Failed to fetch leaderboard.' });
    }
}
