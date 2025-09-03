import express from 'express';
import CallController from '../controllers/callController.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import {
  initiateCallSchema,
  endCallSchema,
  callIdParamSchema
} from '../validations/callValidation.js';

// Export a function that creates the router with io and userSockets
export default function createCallRoutes(io, userSockets) {
  const router = express.Router();
  const callController = new CallController(io, userSockets);

  // Initiate call
  router.post('/initiate',
    validateBody(initiateCallSchema),
    callController.initiateCall.bind(callController)
  );

  // Answer call
  router.post('/:callId/answer',
    validateParams(callIdParamSchema),
    callController.answerCall.bind(callController)
  );

  // Decline call
  router.post('/:callId/decline',
    validateParams(callIdParamSchema),
    callController.declineCall.bind(callController)
  );

  // End call
  router.post('/:callId/end',
    validateParams(callIdParamSchema),
    validateBody(endCallSchema),
    callController.endCall.bind(callController)
  );

  // Get call history
  router.get('/history',
    callController.getCallHistory.bind(callController)
  );

  return router;
}