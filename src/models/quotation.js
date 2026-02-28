import mongoose from "mongoose";


const QuotationSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true
      
  
    },
    projectName: {
      type: String,
   
     
     
    },
    referenceNo: {
        type: String,
      trim: true,
      unique    : true,
    },
  
  
    date: {
      type: Date,
      default: null,
    },

    status: {
     type:String,
     default:"Draft",
    enum: ['Draft', 'Sent', 'Accepted', 'Rejected' ]

    },
   documentUrl: { type: String },
  },
  { 
    timestamps: true
  }
);

const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", QuotationSchema);

export default Quotation;