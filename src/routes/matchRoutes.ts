import { Router } from 'express';
import { MatchController } from '../controllers/MatchController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    createMatchValidation,
    joinMatchValidation,
    updateMatchValidation
} from '../middleware/validation/matchValidation';

const router = Router();
const matchController = new MatchController();

// Public routes
router.get('/search', matchController.searchMatches.bind(matchController));
router.get('/:id', matchController.getOne.bind(matchController));

// Protected routes
router.use(authenticate);

router.post('/', validate(createMatchValidation), matchController.createMatch.bind(matchController));
router.post('/:id/join', validate(joinMatchValidation), matchController.joinMatch.bind(matchController));
router.post('/:id/leave', matchController.leaveMatch.bind(matchController));
router.put('/:id/status', validate(updateMatchValidation), matchController.updateMatchStatus.bind(matchController));
router.put('/:id', validate(updateMatchValidation), matchController.update.bind(matchController));
router.delete('/:id', matchController.delete.bind(matchController));

export default router; 