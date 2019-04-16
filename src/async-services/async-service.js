const service = require('../util/services')

async function checkUserIdExists(req, res, next) {
    const user_id = req.params.user_id
    if (user_id === 'undefined') {
        return res.status(400).json({
            error: `user_id is required`
        })
    }
    else{
        try {
            const user_id = await service.checkUserId(
                req.app.get('db'),
                req.params.user_id
            )

            if (!user_id) {
                return res.status(400).json({
                    error: `Invalid user_id`
                })
            }

            res.user_id = user_id

            next()
                
        } catch(error) {
            next(error)
        }
    }
}

module.exports = checkUserIdExists