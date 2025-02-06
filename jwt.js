const jwt = require('jsonwebtoken');
const userModel = require('./models/user')
// const {jwtAuthMiddleware, generateToken, checkAuthForAdmin, verifyJwtToken} = require('.');

// const jwtAuthMiddleware = async (req, res, next) => {

//     // first check request headers has authoruzation or not
//     const authorization = req.headers.authorization
//     if(!authorization) return res.status(401).json({error: 'Token not found'});

//     // extract the jwt token from the request headers
//     const token = req.headers.authorization.split(' ')[1];
//     if(!token) return res.status(401).json({error: 'Unauthorized'});



//     try{
//         // verify the jwt token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Attach user information to the request object
//         req.user = decoded
//         console.log("decode",decoded);
//         const user = await userModel.findById(decoded.id);
//         if (user.role !== 'admin') {
//             return res.status(403).json({ error: 'Forbidden: Admins only' });
//           }
//         next();
//     }catch(err){
//         console.log(err);
//         res.status(401).json({error: 'Invalid Token'});
//     }
// }
const jwtAuthMiddleware = async (req, res, next) => {
    // Check if the Authorization header exists
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Token not found' });

    // Extract the JWT token from the Authorization header
    const token = authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;

        console.log("Decoded token:", decoded);
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid Token' });
    }
};


// var checkAuth = async (req, res, next) => {
//     try {
//         const header = req.headers.authorization;
//         if (!header) {
//             return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST)
//                 .json(
//                     {
//                         status: messages.STATUS_CODE_FOR_BAD_REQUEST,
//                         message: messages.AUTH_HEADER_MISSING_ERR
//                     }
//                 );
//         }
//         const token = header.split("Bearer ")[1];
//         if (!token) {
//             return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST)
//                 .json({
//                     status: messages.STATUS_CODE_FOR_BAD_REQUEST,
//                     message: messages.AUTH_TOKEN_MISSING_ERR
//                 });
//         }
//         const userAuth = await verifyJwtToken(token)
//         if (!userAuth) {
//             return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED)
//                 .json({
//                     status: messages.STATUS_CODE_FOR_UNAUTHORIZED,
//                     message: messages.JWT_DECODE_ERR
//                 });
//         }
//         const user = await userModel.find({ "email_id": userAuth.email_id });
//         if (!user) {
//             return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST)
//                 .json({
//                     status: messages.STATUS_CODE_FOR_BAD_REQUEST,
//                     message: messages.USER_NOT_FOUND_ERR
//                 });
//         }
//         else {
//             res.locals.user = user;
//             next()
//         }
//     } catch (error) {
//         return res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR)
//             .json({
//                 "status": messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
//                 "message": messages.CATCH_BLOCK_ERROR,
//                 "errorMessage": error.message
//             });
//     }
// };

const checkAuthForAdmin = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(400).
                json({
                    status: 400,
                    message: 'auth header is missing'
                });
        }
        const token = header.split("Bearer ")[1];
        if (!token) {
            return res.status(400)
                .json({
                    status: 400,
                    message: 'auth token is missing'
                })
        }
        const userAuth = await verifyJwtToken(token)
        if (!userAuth) {
            return res.status(401).
                json({
                    status: 401,
                    message: 'incorrect token'
                });
        }
        // const user = await userModel.find({ "email_id": userAuth.email_id });
        // if (user.length <= 1 && user[0].role == 'admin') {
        //     next();
        // }
        console.log(userAuth)
        const user = await userModel.findById(userAuth.id);
        if (user && user.role == 'admin') {
            next();
        }
        else {
            return res.status(400)
                .json({
                    status: 400,
                    message: 'you are not admin',
                });
        }

    } catch (error) {
        console.log(error)
        return res.status(500)
            .json({
                "status": 500,
                "message": 'somthing went wrong',
                "errorMessage": error.message
            });
    }
};

// function to genrate jwt token
const generateToken = (userData) => {
    // generate a new jwt token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 30000});
}
const verifyJwtToken = async (token) => {
    try {
        const _id = await jwt.verify(token, process.env.JWT_SECRET);
        return _id;
      } catch (err) {
        return false;
      }
}



module.exports = {jwtAuthMiddleware, generateToken, checkAuthForAdmin, verifyJwtToken}