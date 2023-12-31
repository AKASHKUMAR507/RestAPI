import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { REFRESH_SECRET } from "../../config";
import JwtService from "../../services/JwtServices";


const refreshController = {
    async refresh(req, res, next){
        // validate the request
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required()
        })

        const {error} = refreshSchema.validate(req.body);

        if(error){
            return next(error);
        }

        // database 
        let refreshtoken;
        try {
            refreshtoken = await RefreshToken.findOne({token: req.body.refresh_token});

            if(!refreshtoken){
                return next(CustomErrorHandler.unAuthorized ('Invalid refresh token'));
            }

            let userId;
            try {
                const { _id } = await JwtService.verify(refreshtoken.token, REFRESH_SECRET);
                userId = _id;
            } catch (error) {
                return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
            }


            const user = User.findOne({_id: userId}); 

            if(!user){
                return next(CustomErrorHandler.unAuthorizedError('No user found'));
            }

            // token 
            const access_token = JwtService.sign({ _id: user._id, role: user.role })
            const refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET)
            
            await RefreshToken.create({token: refresh_token})

            res.json({access_token: access_token, refresh_token: refresh_token})

        } catch (error) {
            return next(new Error('Something went wrong' + error.message));
        }

    }
};
export default refreshController