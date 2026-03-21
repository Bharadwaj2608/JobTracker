import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position/Role is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: 'Remote'
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  status: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'approved', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  jobUrl: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  followUpDate: {
    type: Date
  },
  interviewDate: {
    type: Date
  },
  source: {
    type: String,
    enum: ['linkedin', 'indeed', 'glassdoor', 'company-website', 'referral', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [String],
  emailMetadata: {
    messageId: { type: String, default: null },
    subject: { type: String, default: null },
    from: { type: String, default: null },
  },
  autoImported: { type: Boolean, default: false },
}, 
  
{
  timestamps: true
});

const Job = mongoose.model('Job', JobSchema);
export default Job;
