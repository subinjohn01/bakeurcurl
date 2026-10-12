/**
 * BakeUrCurl — Customer Management Controller (Admin)
 *
 * Endpoints:
 *  - GET    /api/customers        List all customers with bookings summary & search
 *  - GET    /api/customers/:id    Get customer details and full booking history
 *  - POST   /api/customers        Create new customer profile
 *  - PUT    /api/customers/:id    Update customer (name, phone, email, address, birthday)
 *  - DELETE /api/customers/:id    Delete customer
 */

const User = require('../models/User');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');

// ─── getAllCustomers ──────────────────────────────────────────────────────────
const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = { role: 'customer' };

    if (search) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }

    const customers = await User.find(query)
      .select('name email phone address birthday createdAt avatar role')
      .sort({ createdAt: -1 });

    // Aggregate booking stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (c) => {
        const phoneRegex = c.phone ? c.phone.replace(/\D/g, '').slice(-10) : null;

        const bookingFilter = {
          $or: [
            { customer: c._id },
            ...(c.email ? [{ 'guestInfo.email': c.email.toLowerCase() }] : []),
            ...(phoneRegex ? [{ 'guestInfo.phone': { $regex: phoneRegex + '$' } }] : []),
          ],
        };

        const totalBookings = await Booking.countDocuments(bookingFilter);
        const bookings = await Booking.find(bookingFilter).select('totalAmount status');

        const totalSpent = bookings
          .filter((b) => b.status === 'completed' || b.status === 'confirmed')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
          ...c.toObject(),
          totalBookings,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithStats.length,
      customers: customersWithStats,
    });
  } catch (err) {
    next(err);
  }
};

// ─── getCustomerById (with booking history) ───────────────────────────────────
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const phoneRegex = customer.phone ? customer.phone.replace(/\D/g, '').slice(-10) : null;

    const bookingFilter = {
      $or: [
        { customer: customer._id },
        ...(customer.email ? [{ 'guestInfo.email': customer.email.toLowerCase() }] : []),
        ...(phoneRegex ? [{ 'guestInfo.phone': { $regex: phoneRegex + '$' } }] : []),
      ],
    };

    const bookings = await Booking.find(bookingFilter)
      .populate('service', 'name price duration')
      .populate('staff', 'name email phone')
      .sort({ date: -1, createdAt: -1 });

    const totalSpent = bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      customer,
      totalBookings: bookings.length,
      totalSpent,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// ─── createCustomer ───────────────────────────────────────────────────────────
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, birthday } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required.',
      });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A user with email '${email}' already exists.`,
      });
    }

    // Default secure password if admin creates customer manually
    const defaultPassword = 'BakeUrCurl@' + Math.floor(1000 + Math.random() * 9000);

    const customer = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      birthday: birthday ? birthday.trim() : '',
      role: 'customer',
      password: defaultPassword,
    });

    res.status(201).json({
      success: true,
      message: `Customer profile for '${customer.name}' created successfully!`,
      customer,
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateCustomer ───────────────────────────────────────────────────────────
const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, birthday } = req.body;

    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // If email is changing, check uniqueness
    if (email && email.trim().toLowerCase() !== customer.email.toLowerCase()) {
      const emailTaken = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: customer._id },
      });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: `Email '${email}' is already taken by another account.`,
        });
      }
      customer.email = email.trim().toLowerCase();
    }

    if (name) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone ? phone.trim() : '';
    if (address !== undefined) customer.address = address ? address.trim() : '';
    if (birthday !== undefined) customer.birthday = birthday ? birthday.trim() : '';

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully!',
      customer,
    });
  } catch (err) {
    next(err);
  }
};

// ─── deleteCustomer ───────────────────────────────────────────────────────────
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Customer '${customer.name}' deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
