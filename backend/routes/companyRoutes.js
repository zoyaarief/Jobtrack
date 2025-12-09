import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const db = req.db;
        const questions = db.collection("questions");

        const search = req.query.search?.trim() || "";

        let matchStage = {};
        if (search) {
            matchStage = {
                company: { $regex: new RegExp(search, "i") },
            };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: { $toLower: "$company" },
                    originalName: { $first: "$company" },
                    resourcesCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$originalName",
                    resourcesCount: 1,
                    logo: {
                        $concat: [
                            "https://logo.clearbit.com/",
                            { $toLower: "$originalName" },
                            ".com",
                        ],
                    },
                },
            },
            { $sort: { resourcesCount: -1 } },
        ];

        const companies = await questions.aggregate(pipeline).toArray();

        res.status(200).json(companies);
    } catch (err) {
        console.error("Error fetching companies:", err);
        res.status(500).json({ message: "Server error while fetching companies" });
    }
});

export default router;
