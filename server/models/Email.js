const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  cc: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bcc: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Email body is required'],
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  labels: [{
    type: String,
    enum: ['inbox', 'sent', 'draft', 'trash', 'important', 'spam']
  }],
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailThread'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'
  },
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'
  }
}, {
  timestamps: true
});

// Index for better query performance
emailSchema.index({ from: 1, createdAt: -1 });
emailSchema.index({ to: 1, createdAt: -1 });
emailSchema.index({ isRead: 1, createdAt: -1 });
emailSchema.index({ labels: 1, createdAt: -1 });

// Virtual for formatted date
emailSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Transform output
emailSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Email', emailSchema);
