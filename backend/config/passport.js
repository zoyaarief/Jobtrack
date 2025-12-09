// backend/config/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

export default function (passport, db) {
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || "temp_secret_fallback", // Safety fallback
        passReqToCallback: true,
    };

    // 💡 FIX: Explicitly name the strategy 'jwt'
    passport.use(
        "jwt",
        new JwtStrategy(options, async (req, jwt_payload, done) => {
            try {
                const users = db.collection("users");
                const user = await users.findOne({ _id: new ObjectId(jwt_payload.id) });

                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                console.error("Passport Error:", err);
                return done(err, false);
            }
        })
    );
}