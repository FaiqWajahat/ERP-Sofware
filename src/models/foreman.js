import mongoose from 'mongoose';

const foremanSchema = new mongoose.Schema({
  // 1. Identification (Linked to existing modules)
  foremanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', 
    required: true
  },
  foremanName: {
    type: String,
    required: true
  },
  
  // 2. Project Context
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  projectLocation: {
    type: String,
    required: false
  },

  // 3. The Transaction Ledger
  // 'amountSent' tracks cash/transfers to foreman
  amountSent: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Bank Transfer', 'UPI'], default: 'Cash' },
    referenceNo: String, // e.g., UTR Number or Cheque Number
    remarks: String
  }],

  // 'invoicesReceived' tracks the bills they bring back
  invoicesReceived: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    invoiceNo: String, 
    category: String, // e.g., 'Local Labor', 'Hardware', 'Fuel'
    remarks: String
  }],

  // 4. Summaries (For quick reporting)
  totalSent: { type: Number, default: 0 },
  totalInvoiced: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 }

}, { timestamps: true });

// Pre-save hook to calculate totals automatically
foremanSchema.pre('save', function(next) {
  this.totalSent = this.amountSent.reduce((acc, curr) => acc + curr.amount, 0);
  this.totalInvoiced = this.invoicesReceived.reduce((acc, curr) => acc + curr.amount, 0);
  this.remainingBalance = this.totalSent - this.totalInvoiced;
  next();
});

const Foreman = mongoose.models.Foreman || mongoose.model('Foreman', foremanSchema);

export default Foreman;