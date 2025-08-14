module.exports = (adminKey) => {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.headers['x-admin-key'] !== adminKey) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
};
