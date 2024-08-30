const Product = require('../models/product');
const mongoose = require('mongoose');

exports.products_get_all = (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            if (docs.length > 0) {
                res.status(200).json(response);
            } else {
                res.status(200).json({
                    message: 'No entries were found.'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_create_product = (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Product has been created.',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

}

exports.product_get_product = (req, res, next) => {
    const id = req.params.productID;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    _id: doc._id,
                    name: doc.name,
                    price: doc.price
                });
            } else {
                res.status(404).json({ messaege: 'No valid entry found for the provided ID' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
}

exports.product_patch_product = (req, res, next) => {
    const id = req.params.productID;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product has been updated.',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.product_delete_product = (req, res, next) => {
    const id = req.params.productID;
    Product.findById(id)
        .then(doc => {
            if (!doc) {
                return res.status(404).json({
                    message: 'The product does not exist.'
                });
            }
            return Product.deleteOne({ _id: id }).exec();
        })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: `The product with the id: ${id} has been deleted.`,
                });
            }
        })
        .catch(err => {
            if (!res.headersSent) {
                res.status(500).json({
                    error: err
                });
            }
        });
}