const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');


exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name _id')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,

                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}
exports.orders_create_order = (req, res, next) => {
    console.log(req.body);
    Product.findById(req.body.productId)
        .then(result => {
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            order.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(404).json({
                message: 'Product not found.',
                error: err
            });
        });

}

exports.orders_get_order = (req, res, next) => {
    const orderID = req.params.orderID;

    if (!mongoose.Types.ObjectId.isValid(orderID)) {
        return res.status(404).json({
            message: 'Order not found'
        });
    }

    Order.findById(orderID)
        .populate('product')
        .exec()
        .then(order => {
            if (order) {
                res.status(200).json({
                    order: order,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders'
                    }
                });
            } else {
                res.status(404).json({
                    message: 'Order not found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}

exports.orders_delete_order = (req, res, next) => {
    Order.findById(req.params.orderID)
        .then(order => {
            if (!order) {
                res.status(404).json({
                    message: "The order does not exist."
                });
            }
            Order.deleteOne({ _id: req.params.orderID }).exec();

        })
        .then(result => {
            res.status(200).json({
                message: "The order has been deleted.",
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders',
                    body: {
                        productID: 'ID',
                        quantity: 'Number'
                    }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}




/*exports.orders_delete_order = (req, res, next) => {
    Order.deleteOne({
        _id: req.params.orderID
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order has been deleted',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders',
                    body: {
                        productID: 'ID',
                        quantity: 'Number'
                    }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}*/
