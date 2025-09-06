import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Save, ArrowLeft, Paperclip } from 'lucide-react';

const ComposeEmail = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.to.trim()) {
      newErrors.to = 'Recipients are required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Email body is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseRecipients = (recipientsString) => {
    return recipientsString
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const emailData = {
        to: parseRecipients(formData.to),
        cc: formData.cc ? parseRecipients(formData.cc) : [],
        bcc: formData.bcc ? parseRecipients(formData.bcc) : [],
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        isDraft: false
      };

      await axios.post('/api/emails', emailData);
      toast.success('Email sent successfully!');
      navigate('/mailbox');
    } catch (error) {
      console.error('Error sending email:', error);
      const message = error.response?.data?.message || 'Failed to send email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.subject.trim() && !formData.body.trim()) {
      toast.error('Cannot save empty draft');
      return;
    }

    setSaving(true);
    
    try {
      const emailData = {
        to: formData.to ? parseRecipients(formData.to) : [],
        cc: formData.cc ? parseRecipients(formData.cc) : [],
        bcc: formData.bcc ? parseRecipients(formData.bcc) : [],
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        isDraft: true
      };

      await axios.post('/api/emails', emailData);
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="d-flex align-items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/mailbox')}
              className="btn btn-outline"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="page-title">Compose Email</h1>
          </div>
        </div>

        <div className="compose-container">
          <div className="compose-form">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <div className="form-group">
                <label htmlFor="to" className="form-label">
                  To *
                </label>
                <input
                  type="text"
                  id="to"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  className={`form-control ${errors.to ? 'error' : ''}`}
                  placeholder="recipient@example.com, another@example.com"
                  disabled={loading || saving}
                />
                {errors.to && <div className="error-message">{errors.to}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cc" className="form-label">CC</label>
                  <input
                    type="text"
                    id="cc"
                    name="cc"
                    value={formData.cc}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="cc@example.com"
                    disabled={loading || saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bcc" className="form-label">BCC</label>
                  <input
                    type="text"
                    id="bcc"
                    name="bcc"
                    value={formData.bcc}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="bcc@example.com"
                    disabled={loading || saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`form-control ${errors.subject ? 'error' : ''}`}
                  placeholder="Enter email subject"
                  disabled={loading || saving}
                />
                {errors.subject && <div className="error-message">{errors.subject}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="body" className="form-label">
                  Message *
                </label>
                <textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  className={`form-control email-body ${errors.body ? 'error' : ''}`}
                  placeholder="Type your message here..."
                  disabled={loading || saving}
                />
                {errors.body && <div className="error-message">{errors.body}</div>}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="btn btn-outline"
                    disabled={loading || saving}
                  >
                    <Save className="inline-block mr-2" size={16} />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={loading || saving}
                  >
                    <Paperclip className="inline-block mr-2" size={16} />
                    Attach
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || saving}
                >
                  <Send className="inline-block mr-2" size={16} />
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
