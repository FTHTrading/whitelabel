// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - BACKEND CONTROL PLANE API SERVER
// ==========================================================================

const express = require('express');
const cors = require('cors');
const auditRoutes = require('./routes/audit');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8905;

// MOUNT AUDIT EXPORT ROUTES
app.use('/api/v1/audit', auditRoutes);

// HEALTH & CONTEXT ROUTE
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: 'sandbox',
    apiVersion: 'v1.0',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[UnyKorn Enterprise Fabric API] Running on port ${PORT}`);
  });
}

module.exports = app;
