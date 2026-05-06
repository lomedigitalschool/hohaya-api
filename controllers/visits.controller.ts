import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";
import Properties from "../models/Properties";
import Visits from "../models/Visits";

//
// 🧱 CREATE VISIT
//
export async function createVisit(req: AuthRequest, res: Response) {
    try {
        const { propertyId, visitDate, message } = req.body;

        if (!propertyId || !visitDate) {
            return res.status(400).json({ message: "Missing fields" });
        }

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ message: "Invalid propertyId" });
        }

        const date = new Date(visitDate);
        if (isNaN(date.getTime()) || date < new Date()) {
            return res.status(400).json({ message: "Invalid visit date" });
        }

        const property = await Properties.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // anti doublon actif
        const existing = await Visits.findOne({
            propertyId,
            tenantId: req.user.userId,
            status: { $in: ["pending", "accepted", "rescheduled"] }
        });

        if (existing) {
            return res.status(400).json({ message: "Active visit already exists" });
        }

        const visit = await Visits.create({
            propertyId,
            tenantId: req.user.userId,
            ownerId: property.ownerId,
            visitDate: date,
            message,
            status: "pending"
        });

        res.status(201).json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 👤 TENANT VISITS
//
export async function getTenantVisits(req: AuthRequest, res: Response) {
    try {
        const visits = await Visits.find({
            tenantId: req.user.userId,
            status: { $ne: "cancelled" },
            deletedAt: null
        }).populate("propertyId");

        res.json(visits);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 🏠 OWNER VISITS
//
export async function getOwnerVisits(req: AuthRequest, res: Response) {
    try {
        const visits = await Visits.find({
            ownerId: req.user.userId,
            status: { $ne: "cancelled" },
            deletedAt: null
        })
            .populate("propertyId")
            .populate("tenantId", "firstName email");

        res.json(visits);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 📄 GET BY ID
//
export async function getVisitById(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId)
            .populate("propertyId")
            .populate("tenantId")
            .populate("ownerId");

        if (!visit || visit.deletedAt) {
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
// ✅ ACCEPT VISIT (atomic safe Mongoose)
//
export async function acceptVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findOneAndUpdate(
            {
                _id: req.params.visitId,
                ownerId: req.user.userId,
                status: "pending",
                deletedAt: null
            },
            { status: "accepted" },
            { new: true }
        );

        if (!visit) {
            return res.status(400).json({ message: "Invalid or already processed" });
        }

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// ❌ REJECT VISIT
//
export async function rejectVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findOneAndUpdate(
            {
                _id: req.params.visitId,
                ownerId: req.user.userId,
                status: "pending",
                deletedAt: null
            },
            { status: "rejected" },
            { new: true }
        );

        if (!visit) {
            return res.status(400).json({ message: "Invalid or already processed" });
        }

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 🔁 RESCHEDULE VISIT
//
export async function rescheduleVisit(req: AuthRequest, res: Response) {
    try {
        const { visitDate } = req.body;

        if (!visitDate) {
            return res.status(400).json({ message: "visitDate required" });
        }

        const date = new Date(visitDate);
        if (isNaN(date.getTime()) || date < new Date()) {
            return res.status(400).json({ message: "Invalid date" });
        }

        const visit = await Visits.findById(req.params.visitId);

        if (!visit || visit.deletedAt) {
            return res.status(404).json({ message: "Visit not found" });
        }

        const userId = req.user.userId;

        if (
            visit.ownerId.toString() !== userId &&
            visit.tenantId.toString() !== userId
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (["rejected", "cancelled", "completed"].includes(visit.status)) {
            return res.status(400).json({ message: "Cannot reschedule this visit" });
        }

        visit.visitDate = date;
        visit.status = "rescheduled";

        await visit.save();

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 🚫 CANCEL VISIT
//
export async function cancelVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId);

        if (!visit || visit.deletedAt) {
            return res.status(404).json({ message: "Visit not found" });
        }

        const userId = req.user.userId;

        if (
            visit.ownerId.toString() !== userId &&
            visit.tenantId.toString() !== userId
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (["completed", "cancelled"].includes(visit.status)) {
            return res.status(400).json({ message: "Cannot cancel this visit" });
        }

        visit.status = "cancelled";
        await visit.save();

        res.json(visit);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//
// 🗑 SOFT DELETE
//
export async function deleteVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.visitId);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        visit.deletedAt = new Date();
        await visit.save();

        res.json({ message: "Visit deleted" });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}