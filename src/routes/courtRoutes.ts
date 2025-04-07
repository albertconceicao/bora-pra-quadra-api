import { Router } from 'express';
import { CourtController } from '../controllers/CourtController';
import { authenticate, isCourtCreator } from '../middleware/auth';
import { locationRules, validate } from '../middleware/validation';
import { createCourtValidation, updateCourtValidation } from '../middleware/validation/courtValidation';

const router = Router();
const courtController = new CourtController();

// Public routes
router.get('/search', validate(locationRules), courtController.searchCourts.bind(courtController));
router.get('/:id', courtController.getOne.bind(courtController));

// Protected routes
router.use(authenticate);
router.post('/', validate(createCourtValidation), courtController.createCourt.bind(courtController));
router.put('/:id', [isCourtCreator, validate(updateCourtValidation)], courtController.update.bind(courtController));
router.delete('/:id', isCourtCreator, courtController.delete.bind(courtController));

// Affiliation routes
router.post('/:courtId/request-affiliation', courtController.requestAffiliation.bind(courtController));
router.post('/handle-affiliation', courtController.handleAffiliationRequest.bind(courtController));
router.delete('/remove-affiliation', courtController.removeAffiliation.bind(courtController));

export default router; 