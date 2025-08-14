module.exports = (req, res, next) => {
  const key = req.header('x-admin-key');
  if (!key || key !== process.env.ADMIN_API_KEY) return res.sendStatus(401);
  next();
};
