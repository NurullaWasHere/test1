import jwt from 'jsonwebtoken';

export default class AuthMiddleware {
  static verifyToken(req, res, next) {
    if(req.method === "OPTIONS"){
      next();
    }
    try {
        const token = req.headers.authorization;
        if (!token){
            return res.json({
                message:"User not logged",
                headers: req.headers
            })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        
        return res.status(401).json({
            message:"Error",
            err
        })
    }
  }
}