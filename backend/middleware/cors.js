const cors = require('cors');

module.exports = (origin) => {
  return cors({ origin, credentials: false });
};
