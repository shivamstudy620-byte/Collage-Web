const mongoose = require('mongoose');

const isValidResourceId = (id) => {
  if (typeof id !== 'string' && typeof id !== 'number') return false;
  const idStr = String(id).trim();
  return mongoose.Types.ObjectId.isValid(idStr) || /^\d+$/.test(idStr);
};

const findByIdOrLegacy = (Model, id) => {
  if (!isValidResourceId(id)) return null;
  const idStr = String(id).trim();
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    return Model.findOne({ _id: idStr });
  }
  return Model.findOne({ sqlite_id: Number(idStr) });
};

const ensureDbConnected = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'Database service unavailable. Please try again later.' });
    return false;
  }
  return true;
};

module.exports = {
  isValidResourceId,
  findByIdOrLegacy,
  ensureDbConnected
};
