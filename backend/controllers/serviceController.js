/**
 * BakeUrCurl — Service Controller
 *
 * Functions:
 *   createService    POST   /api/services        (admin)
 *   getServices      GET    /api/services        (public)
 *   getServiceById   GET    /api/services/:id    (public)
 *   updateService    PUT    /api/services/:id    (admin)
 *   deleteService    DELETE /api/services/:id    (admin)
 */

const Service = require('../models/Service');

// ─── createService ────────────────────────────────────────────────────────────
/**
 * @desc    Create a new salon service
 * @route   POST /api/services
 * @access  Private — admin
 */
const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, category, image } = req.body;

    const service = await Service.create({
      name,
      description,
      price,
      duration,
      category,
      image: image || '',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

// ─── getServices ──────────────────────────────────────────────────────────────
/**
 * @desc    Get all active services with optional filtering
 * @route   GET /api/services?category=&minPrice=&maxPrice=&search=
 * @access  Public
 */
const getServices = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, includeInactive } = req.query;

    const filter = {};

    // Only admins can request inactive services
    if (!includeInactive || includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter)
      .populate('createdBy', 'name')
      .sort({ category: 1, price: 1 });

    res.status(200).json({ success: true, count: services.length, services });
  } catch (err) {
    next(err);
  }
};

// ─── getServiceById ───────────────────────────────────────────────────────────
/**
 * @desc    Get a single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('createdBy', 'name');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.status(200).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

// ─── updateService ────────────────────────────────────────────────────────────
/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private — admin
 */
const updateService = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'price', 'duration', 'category', 'image', 'isActive'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.status(200).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

// ─── deleteService ────────────────────────────────────────────────────────────
/**
 * @desc    Soft-delete a service (sets isActive = false)
 * @route   DELETE /api/services/:id
 * @access  Private — admin
 */
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.status(200).json({ success: true, message: 'Service deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
