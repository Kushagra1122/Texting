const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
   
    try {
        const decode = jwt.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        );
   
        req.user = decode.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;
