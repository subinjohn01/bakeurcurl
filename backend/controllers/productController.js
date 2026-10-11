/**
 * BakeUrCurl — Product Controller
 *
 * Functions:
 *   createProduct    POST   /api/products        (admin)
 *   getProducts      GET    /api/products        (public)
 *   getProductById   GET    /api/products/:id    (public)
 *   updateProduct    PUT    /api/products/:id    (admin)
 *   deleteProduct    DELETE /api/products/:id    (admin)
 */

const Product = require('../models/Product');

// ─── createProduct ────────────────────────────────────────────────────────────
/**
 * @desc    Create a new retail product
 * @route   POST /api/products
 * @access  Private — admin
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, brand, stock, images } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock: stock || 0,
      images: images || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ─── getProducts ──────────────────────────────────────────────────────────────
/**
 * @desc    Get all products with optional filters and pagination
 * @route   GET /api/products?category=&brand=&minPrice=&maxPrice=&inStockOnly=&search=&page=&limit=
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category, brand, minPrice, maxPrice,
      inStockOnly, search, includeInactive,
      page = 1, limit = 20,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    if (!includeInactive || includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (inStockOnly === 'true') filter.stock = { $gt: 0 };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// ─── getProductById ───────────────────────────────────────────────────────────
/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ─── updateProduct ────────────────────────────────────────────────────────────
/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private — admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'price', 'category', 'brand', 'stock', 'images', 'isActive'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ─── deleteProduct ────────────────────────────────────────────────────────────
/**
 * @desc    Soft-delete a product (sets isActive = false)
 * @route   DELETE /api/products/:id
 * @access  Private — admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, message: 'Product deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
