// seed.js
import dotenv from "dotenv";
import { connectDB } from "./backend/db/mongo.js";

// Load environment variables
dotenv.config({ path: "./backend/.env" });
dotenv.config(); // Fallback

// 👇 YOUR EMAIL (So you can edit/delete them)
const MY_EMAIL = "1233@gmail.com";

const COMPANIES = ["Google", "Apple", "Meta", "Amazon", "Netflix", "Tesla", "Microsoft", "Spotify", "Adobe", "Twitter", "Uber", "Airbnb"];
const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Product Manager", "Data Scientist", "DevOps Engineer", "Mobile Developer", "QA Engineer"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = [
    "Reverse a Linked List", "Design a cache system", "Explain the event loop",
    "Center a div", "SQL Joins", "REST vs GraphQL", "Binary Search Tree",
    "System Design: Twitter", "Reduce array method", "Python Decorators",
    "Kubernetes Pods", "CI/CD Pipelines", "Behavioral: Conflict resolution"
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    try {
        const db = await connectDB();
        const collection = db.collection("questions");

        console.log("🌱 Clearing old questions...");
        await collection.deleteMany({}); // Start fresh to ensure clean data

        const questions = [];

        console.log("🏭 Generating 1,000+ synthetic records...");

        for (let i = 0; i < 1050; i++) {
            const company = getRandom(COMPANIES);
            const role = getRandom(ROLES);
            const topic = getRandom(TOPICS);

            questions.push({
                company: company,
                role: role,
                questionTitle: `${topic} - Variation ${i + 1}`,
                questionDetail: `This is a synthetic question generated for testing purposes.\n\nContext: Asked during the ${role} interview at ${company}.\n\nTips: Focus on fundamentals. This is question #${i+1}.`,
                difficulty: getRandom(DIFFICULTIES),
                userEmail: MY_EMAIL, // Links to you
                userId: "dummy_seed_id",
                username: "SeedBot", // Display name
                createdAt: Date.now() - Math.floor(Math.random() * 1000000000), // Random past date
            });
        }

        await collection.insertMany(questions);

        console.log(`✅ Successfully inserted ${questions.length} records!`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
}

seed();