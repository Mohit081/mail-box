const express = require('express');
const { body, validationResult } = require('express-validator');
const Email = require('../models/Email');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/emails
// @desc    Get user's emails (inbox, sent, drafts, etc.)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const label = req.query.label || 'inbox';
    const search = req.query.search || '';

    let query = { isDeleted: false };
    let sortField = { createdAt: -1 };

    // Build query based on label
    switch (label) {
      case 'inbox':
        query.to = req.user._id;
        query.isDraft = false;
        break;
      case 'sent':
        query.from = req.user._id;
        query.isDraft = false;
        break;
      case 'drafts':
        query.from = req.user._id;
        query.isDraft = true;
        break;
      case 'important':
        query.to = req.user._id;
        query.isImportant = true;
        query.isDraft = false;
        break;
      case 'trash':
        query.isDeleted = true;
        query.$or = [
          { from: req.user._id },
          { to: req.user._id }
        ];
        break;
      default:
        query.to = req.user._id;
        query.isDraft = false;
    }

    // Add search functionality
    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { subject: { $regex: search, $options: 'i' } },
            { body: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const emails = await Email.find(query)
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('cc', 'firstName lastName email')
      .populate('bcc', 'firstName lastName email')
      .sort(sortField)
      .skip(skip)
      .limit(limit);

    const total = await Email.countDocuments(query);

    res.json({
      emails,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/emails/:id
// @desc    Get single email
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id)
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('cc', 'firstName lastName email')
      .populate('bcc', 'firstName lastName email')
      .populate('replyTo', 'subject from to');

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user has access to this email
    const hasAccess = email.from._id.toString() === req.user._id.toString() ||
                     email.to.some(recipient => recipient._id.toString() === req.user._id.toString()) ||
                     email.cc.some(recipient => recipient._id.toString() === req.user._id.toString()) ||
                     email.bcc.some(recipient => recipient._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read if user is recipient
    if (email.to.some(recipient => recipient._id.toString() === req.user._id.toString()) && !email.isRead) {
      email.isRead = true;
      await email.save();
    }

    res.json({ email });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/emails
// @desc    Send new email or save draft
// @access  Private
router.post('/', [
  auth,
  body('to').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('body').trim().isLength({ min: 1 }).withMessage('Email body is required'),
  body('isDraft').optional().isBoolean().withMessage('isDraft must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { to, cc, bcc, subject, body, isDraft = false, attachments = [] } = req.body;

    // Validate recipients exist and convert emails to user IDs
    const recipientEmails = [...to, ...(cc || []), ...(bcc || [])];
    const recipients = await User.find({ email: { $in: recipientEmails }, isActive: true });
    
    if (recipients.length !== recipientEmails.length) {
      return res.status(400).json({ message: 'One or more recipients not found' });
    }

    // Convert emails to user IDs
    const emailToIdMap = {};
    recipients.forEach(user => {
      emailToIdMap[user.email] = user._id;
    });

    const toIds = to.map(email => emailToIdMap[email]);
    const ccIds = (cc || []).map(email => emailToIdMap[email]);
    const bccIds = (bcc || []).map(email => emailToIdMap[email]);

    // Create email
    const email = new Email({
      from: req.user._id,
      to: toIds,
      cc: ccIds,
      bcc: bccIds,
      subject,
      body,
      attachments,
      isDraft,
      labels: isDraft ? ['draft'] : ['sent']
    });

    await email.save();

    // Populate the response
    await email.populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' },
      { path: 'cc', select: 'firstName lastName email' },
      { path: 'bcc', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: isDraft ? 'Draft saved successfully' : 'Email sent successfully',
      email
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/emails/:id
// @desc    Update email (mark as read, important, etc.)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user has access to this email
    const hasAccess = email.from.toString() === req.user._id.toString() ||
                     email.to.includes(req.user._id) ||
                     email.cc.includes(req.user._id) ||
                     email.bcc.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update email
    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' },
      { path: 'cc', select: 'firstName lastName email' },
      { path: 'bcc', select: 'firstName lastName email' }
    ]);

    res.json({
      message: 'Email updated successfully',
      email: updatedEmail
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/emails/:id
// @desc    Delete email (move to trash)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user has access to this email
    const hasAccess = email.from.toString() === req.user._id.toString() ||
                     email.to.includes(req.user._id) ||
                     email.cc.includes(req.user._id) ||
                     email.bcc.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete - move to trash
    email.isDeleted = true;
    email.labels = ['trash'];
    await email.save();

    res.json({ message: 'Email moved to trash successfully' });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/emails/:id/reply
// @desc    Reply to email
// @access  Private
router.post('/:id/reply', [
  auth,
  body('body').trim().isLength({ min: 1 }).withMessage('Reply body is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const originalEmail = await Email.findById(req.params.id);
    
    if (!originalEmail) {
      return res.status(404).json({ message: 'Original email not found' });
    }

    // Check if user has access to reply
    const hasAccess = originalEmail.to.includes(req.user._id) ||
                     originalEmail.cc.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { body } = req.body;
    const replySubject = originalEmail.subject.startsWith('Re: ') 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject}`;

    // Create reply
    const reply = new Email({
      from: req.user._id,
      to: [originalEmail.from],
      cc: originalEmail.cc.filter(id => id.toString() !== req.user._id.toString()),
      subject: replySubject,
      body,
      replyTo: originalEmail._id,
      labels: ['sent']
    });

    await reply.save();

    await reply.populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' },
      { path: 'cc', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Reply sent successfully',
      email: reply
    });
  } catch (error) {
    console.error('Reply email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/emails/:id/forward
// @desc    Forward email
// @access  Private
router.post('/:id/forward', [
  auth,
  body('to').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('body').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const originalEmail = await Email.findById(req.params.id);
    
    if (!originalEmail) {
      return res.status(404).json({ message: 'Original email not found' });
    }

    // Check if user has access to forward
    const hasAccess = originalEmail.from.toString() === req.user._id.toString() ||
                     originalEmail.to.includes(req.user._id) ||
                     originalEmail.cc.includes(req.user._id) ||
                     originalEmail.bcc.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { to, cc, bcc, body } = req.body;
    const forwardSubject = originalEmail.subject.startsWith('Fwd: ') 
      ? originalEmail.subject 
      : `Fwd: ${originalEmail.subject}`;

    // Validate recipients exist and convert emails to user IDs
    const recipientEmails = [...to, ...(cc || []), ...(bcc || [])];
    const recipients = await User.find({ email: { $in: recipientEmails }, isActive: true });
    
    if (recipients.length !== recipientEmails.length) {
      return res.status(400).json({ message: 'One or more recipients not found' });
    }

    // Convert emails to user IDs
    const emailToIdMap = {};
    recipients.forEach(user => {
      emailToIdMap[user.email] = user._id;
    });

    const toIds = to.map(email => emailToIdMap[email]);
    const ccIds = (cc || []).map(email => emailToIdMap[email]);
    const bccIds = (bcc || []).map(email => emailToIdMap[email]);

    // Create forward
    const forward = new Email({
      from: req.user._id,
      to: toIds,
      cc: ccIds,
      bcc: bccIds,
      subject: forwardSubject,
      body: body || `\n\n--- Forwarded message ---\nFrom: ${originalEmail.from}\nTo: ${originalEmail.to.join(', ')}\nSubject: ${originalEmail.subject}\n\n${originalEmail.body}`,
      forwardedFrom: originalEmail._id,
      labels: ['sent']
    });

    await forward.save();

    await forward.populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' },
      { path: 'cc', select: 'firstName lastName email' },
      { path: 'bcc', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Email forwarded successfully',
      email: forward
    });
  } catch (error) {
    console.error('Forward email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
