const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug: print secret
  console.log('Token:', auth ? auth.split(' ')[1] : 'NO TOKEN'); // Debug: print token
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};