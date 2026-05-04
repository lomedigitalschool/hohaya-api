import { Router } from "express";
import auth from "../middlewares/authMiddleware";
import {
    createVisits,
    findTenantVisits,
    findOwnerVisits,
    acceptVisit,
    rejectVisit,
    rescheduleVisit,
    getVisitById,
    deleteVisit,
    visitsStats
} from "../controllers/visits.controller";

const router = Router();

// CREATE
router.post("/", auth, createVisits);

// LISTS
router.get("/tenant/me", auth, findTenantVisits);
router.get("/owner/me", auth, findOwnerVisits);

// ACTIONS OWNER
router.patch("/:visitId/accept", auth, acceptVisit);
router.patch("/:visitId/reject", auth, rejectVisit);

// RESCHEDULE (owner ou tenant selon logique controller)
router.patch("/:visitId/reschedule", auth, rescheduleVisit);

// DETAILS
router.get("/:visitId", auth, getVisitById);

// DELETE
router.delete("/:visitId", auth, deleteVisit);

// STATS
router.get("/stats", auth, visitsStats);

export default router;