import path from "path";
import { Product } from "../models";
import multer from "multer";
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";
import fs from "fs";
import productSchema from "../validators/productValidators";


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 } // 5 mb
}).single('image');

const productController = {
    async store(req, res, next) {
        // multipart form data
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }

            const filePath = req.file.path;

            const { error } = productSchema.validate(req.body);
            if (error) {
                // delete 
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    return next(CustomErrorHandler.serverError(error.message));
                })
                return next(error);
            }

            const { name, price, size } = req.body;

            let document;

            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                }).select('-updatedAt -__v');
            } catch (error) {
                return next(error);
            }

            res.status(201).json(document);
        });
    },

    async update(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }

            let filePath;
            if(req.file){
                filePath = req.file.path;
            }

            const { error } = productSchema.validate(req.body);
            if (error) {
                // delete 
                if(req.file){
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        return next(CustomErrorHandler.serverError(error.message));
                    })
                }
                return next(error);
            }

            const { name, price, size } = req.body;

            let document;

            try {
                document = await Product.findByIdAndUpdate({_id: req.params.id},{
                    name,
                    price,
                    size,
                    ...(req.file && {image: filePath})
                }, {new: true}).select('-updatedAt -__v');

            } catch (error) {
                return next(error);
            }

            res.status(201).json(document);
        });
    },

    async destroy(req, res, next){
        const document = await Product.findOneAndRemove({_id: req.params.id}).select('-updatedAt -__v');

        if(!document){
            return next(new Error('Product not found'));
        }

        //image delete 
        const imagePath = document._doc.image;
        fs.unlink(`${appRoot}/${imagePath}`, (error) => {
            if(error){
                return next(CustomErrorHandler.serverError());
            }

        });

        res.json(document);
    },

    async index(req, res, next) {
        let document;
        // pagination for lib mongoose-pagination 
        try {
            document = await Product.find().select('-updatedAt -__v').sort({createdAt: -1});
        } catch (error) {
            return next(CustomErrorHandler.serverError());
        }

        return res.json(document);
    },

    async showSingleProduct(req, res, next) {
        let document;
        try {
            document = await Product.findOne({_id: req.params.id}).select('-updatedAt -__v');
        } catch (error) {
            return next(CustomErrorHandler.serverError());
        }

        return res.json(document);
    }
}

export default productController;