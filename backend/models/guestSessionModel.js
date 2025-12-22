const mongoose = require('mongoose');

const guestSessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    required: true
  },
  migrated_to_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired sessions
guestSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Static method to find or create guest session
guestSessionSchema.statics.findOrCreate = async function(sessionId) {
  let session = await this.findOne({ 
    session_id: sessionId,
    is_active: true,
    expires_at: { $gt: new Date() }
  });

  if (!session) {
    session = await this.create({ session_id: sessionId });
  }

  return session;
};

// Method to migrate session to user
guestSessionSchema.methods.migrateToUser = function(userId) {
  this.migrated_to_user = userId;
  this.is_active = false;
  return this;
};

const GuestSession = mongoose.model('GuestSession', guestSessionSchema);
module.exports = GuestSession;
