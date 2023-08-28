import mongoose from 'mongoose';
import 'dotenv/config';

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

export default async function conn() {
    try {
        await mongoose
            .connect(
                `mongodb+srv://${dbUser}:${dbPass}@cluster0.zjxjl3f.mongodb.net/?retryWrites=true&w=majority`,
            )
            .catch((e) => console.error(e));

        console.log(`API running on port ${process.env.API_PORT}`);
    } catch (e) {
        console.error(e);
    }
}
