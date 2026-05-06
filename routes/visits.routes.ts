import { Router } from "express";
import auth from "../middlewares/authMiddleware";
import {
  createVisit,
  getTenantVisits,
  getOwnerVisits,
  getVisitById,
  acceptVisit,
  rejectVisit,
  rescheduleVisit,
  cancelVisit,
  deleteVisit
} from "../controllers/visits.controller";

const router = Router();

/**
 * CREATE
 */
router.post("/", auth, createVisit);

/**
 * LISTS
 */
router.get("/tenant/me", auth, getTenantVisits);
router.get("/owner/me", auth, getOwnerVisits);

/**
 * DETAILS
 */
router.get("/:visitId", auth, getVisitById);

/**
 * ACTIONS OWNER / TENANT
 */
router.patch("/:visitId/accept", auth, acceptVisit);
router.patch("/:visitId/reject", auth, rejectVisit);
router.patch("/:visitId/reschedule", auth, rescheduleVisit);
router.patch("/:visitId/cancel", auth, cancelVisit);

/**
 * DELETE (soft cleanup / admin or owner only)
 */
router.delete("/:visitId", auth, deleteVisit);

export default router;