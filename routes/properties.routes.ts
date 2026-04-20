import { Router } from 'express';
import {
    createProperties,
    findProperties,
    propertiesStats
} from '../controllers/properties.controller';

const router = Router();

// Create Properties
router.post('/create/properties', createProperties);

// FInd Properties
router.get('/properties', findProperties);

// Stats : number of properties per location
router.get('/property-stats', propertiesStats);

export default router;