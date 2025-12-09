// backend/middlewares/authMiddleware.js
import passport from "passport";

export const authMiddleware = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        // 1. System Error
        if (err) {
            console.error("❌ Passport System Error:", err);
            return res.status(500).json({ message: "System Error", error: err.message });
        }

        // 2. Auth Failed
        if (!user) {
            // console.error("❌ Passport Auth Failed:", info ? info.message : "Unknown");
            return res.status(401).json({ message: "Unauthorized", reason: info ? info.message : "Unknown" });
        }

        // 3. Success!
        // 💡 CRITICAL FIX: Polyfill 'id' so legacy controllers (authController, questionsRoutes) work.
        // Passport returns the full Mongo document where the ID is '_id'.
        // We attach '.id' (string) so your existing code doesn't break.
        if (user._id) {
            user.id = user._id.toString();
        }

        req.user = user;
        next();
    })(req, res, next);
};