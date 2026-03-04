export const checkAdmin = (req, res, next) => {
    const user = req.user; // assuming user is set from auth middleware
  
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  
    next();
  };
  