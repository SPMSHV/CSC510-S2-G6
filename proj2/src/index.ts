import dotenv from 'dotenv';
import { createServer } from './server';
import { maybeStartTelemetryFromEnv, telemetryService } from './services/telemetry';
import { maybeStartOrderAssignmentService } from './services/orderAssignmentService';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

const app = createServer();

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`CampusBot API listening at http://${host}:${port}`);
  // Initialize telemetry simulator conditionally and prime fleet data
  telemetryService.initializeFleetIfEmpty();
  maybeStartTelemetryFromEnv();
  // Start background service for robot assignment to waiting READY orders
  maybeStartOrderAssignmentService();
});
