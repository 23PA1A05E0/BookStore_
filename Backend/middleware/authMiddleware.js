const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;

            next();
        } catch (err) {
            return res.status(401).json({
                message: "Invalid Token"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "No Token Found"
        });
    }
};
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};

const organizer = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "organizer")) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an organizer" });
    }
};

module.exports = { protect, admin, organizer };