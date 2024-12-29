import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate hours before saving
shiftSchema.pre('save', function(next) {
  const hours = (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
  this.hours = Number(hours.toFixed(2));
  next();
});

export default mongoose.model('Shift', shiftSchema);
