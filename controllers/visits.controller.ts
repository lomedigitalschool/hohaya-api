import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Properties from "../models/Properties";
import Visits from "../models/Visits";

//
// 1. CREATE VISIT
//
export async function createVisits(req: AuthRequest, res: Response) {
    try {
        const { propertyId, visitDate, message } = req.body;

        if (!propertyId || !visitDate) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const property = await Properties.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const existing = await Visits.findOne({
            propertyId,
            tenantId: req.user.userId
        });

        if (existing) {
            return res.status(400).json({ message: "Visit already requested" });
        }

        const visit = await Visits.create({
            propertyId,
            tenantId: req.user.userId,
            ownerId: property.ownerId,
            visitDate,
            message,
            status: "pending"
        });

        res.status(201).json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 2. TENANT VISITS
//
export async function findTenantVisits(req: AuthRequest, res: Response) {
    try {
        const visits = await Visits.find({
            tenantId: req.user.userId
        })
            .populate("propertyId", "title price location")
            .populate("ownerId", "firstName lastName");

        res.json(visits);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 3. OWNER VISITS
//
export async function findOwnerVisits(req: AuthRequest, res: Response) {
    try {
        const visits = await Visits.find({
            ownerId: req.user.userId
        })
            .populate("propertyId", "title price location")
            .populate("tenantId", "firstName email");

        res.json(visits);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 4. ACCEPT VISIT
//
export async function acceptVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        if (visit.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        visit.status = "accepted";
        await visit.save();

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 5. REJECT VISIT
//
export async function rejectVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        if (visit.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        visit.status = "rejected";
        await visit.save();

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 6. RESCHEDULE VISIT
//
export async function rescheduleVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        if (
            visit.ownerId.toString() !== req.user.userId &&
            visit.tenantId.toString() !== req.user.userId
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!req.body.visitDate) {
            return res.status(400).json({ message: "visitDate required" });
        }

        visit.visitDate = req.body.visitDate;
        visit.status = "rescheduled";

        await visit.save();

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 7. GET VISIT BY ID
//
export async function getVisitById(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId)
            .populate("propertyId")
            .populate("tenantId", "firstName email")
            .populate("ownerId", "firstName email");

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        const userId = req.user.userId;

        if (
            visit.ownerId.toString() !== userId &&
            visit.tenantId.toString() !== userId
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 8. DELETE VISIT
//
export async function deleteVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        const userId = req.user.userId;

        if (
            visit.ownerId.toString() !== userId &&
            visit.tenantId.toString() !== userId
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await visit.deleteOne();

        res.json({ message: "Visit deleted" });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 9. STATS
//
export async function visitsStats(req: AuthRequest, res: Response) {
    try {
        const stats = await Visits.aggregate([
            {
                $match: { ownerId: req.user.userId }
            },
            {
                $group: {
                    _id: "$propertyId",
                    totalVisits: { $sum: 1 }
                }
            }
        ]);

        res.json(stats);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}