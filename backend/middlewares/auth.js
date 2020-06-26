const jwt = require('jsonwebtoken');
const logger = require('@grokker/logger');
const { Session } = require('../models/mongo');

// Middle for authenticating the server based on valid jwt token
module.exports = async (req, res, next) => {
    try{
        const token = req.cookies.XID || req.headers.authorization;
        if(!token){
            return res.publish(false, 'Failed', { message: 'Unauthorized !!' }, 401);
        }
        const details = jwt.verify(token, config.JWT.SECRET);
        /**
         * Setting session id and email to req object
         */
        req.user = details.email;
        req.sessionId = details.sessionId;
        if(!localCache[details.sessionId]){
            const sessionDetails = await Session.findOne({ _id: details.sessionId, active: true });
            if(!sessionDetails){
                return res.publish(false, 'Unauthorized', { message: 'Session expired, please login again' }, 401);
            }
            localCache[details.sessionId] = {};
            localCache[details.sessionId].createdDate = new Date().toISOString();
        }
        localCache[details.sessionId].updatedTime = new Date().toISOString();
        next();
    }catch (e) {
        logger.error(`Failed to verify authentication :`, e.message);
        return res.publish(false, 'Unauthorized', { message: 'Session expired, please login again' }, 401);
    }
};
