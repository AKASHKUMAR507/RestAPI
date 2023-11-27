import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import { APP_URL } from '../config';

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true},
    size: { type: String, required: true},
    image: { type: String, required: true, get: (image) =>{
        // uploads\\1700994355548-672582844.png
        return `${APP_URL}/${image}`
    }},
}, { timestamps: true, toJSON: {getters: true}, id: false });

const Product = mongoose.model('Product', productSchema, 'products');
export default Product;
