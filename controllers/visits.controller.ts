import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Properties from "../models/Properties";
import Visits, { IVisit } from "../models/Visits";

// hohoya-mobile's VisitRequest.fromJson (and hohaya-web, once it connects
// this domain) expect a flat shape rather than populated Mongo refs, and
// use 'refused' where this schema's enum says 'rejected' — translate here
// so every endpoint returns the same contract.
function toVisitRequestJson(visit: any) {
    const property = visit.propertyId;
    const tenant = visit.tenantId;
    const owner = visit.ownerId;

    return {
        id: visit._id,
        propertyId: property?._id ?? property,
        propertyTitle: property?.title ?? '',
        visitorName: tenant ? `${tenant.firstName ?? ''} ${tenant.lastName ?? ''}`.trim() : '',
        visitorEmail: tenant?.email ?? '',
        visitorPhone: tenant?.phoneNumber ?? '',
        ownerName: owner ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() : '',
        ownerEmail: owner?.email ?? '',
        ownerPhone: owner?.phoneNumber ?? '',
        requestedDate: visit.visitDate ? new Date(visit.visitDate).toISOString() : '',
        message: visit.message ?? '',
        status: visit.status === 'rejected' ? 'refused' : visit.status,
        refusalReason: visit.refusalReason ?? null,
        createdAt: visit.createdAt ? new Date(visit.createdAt).toISOString() : new Date().toISOString(),
    };
}

const populateVisit = (query: any) =>
    query
        .populate('propertyId', 'title')
        .populate('tenantId', 'firstName lastName email phoneNumber')
        .populate('ownerId', 'firstName lastName email phoneNumber');

// Create a visit request (tenant)
export async function createVisits(req: AuthRequest, res: Response) {
    try {
        const { propertyId, visitDate, message } = req.body;

        const property = await Properties.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const visit = await Visits.create({
            propertyId,
            tenantId: req.user.userId,
            ownerId: property.ownerId,
            visitDate,
            message,
        });

        const populated = await populateVisit(Visits.findById(visit._id));
        res.status(201).json(toVisitRequestJson(populated));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// Visits the connected tenant has requested
export async function findTenantVisits(req: AuthRequest, res: Response) {
    try {
        const visits = await populateVisit(
            Visits.find({ tenantId: req.user.userId }).sort({ createdAt: -1 }),
        );
        res.json(visits.map(toVisitRequestJson));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// Visits requested on the connected owner's properties
export async function findOwnerVisits(req: AuthRequest, res: Response) {
    try {
        const visits = await populateVisit(
            Visits.find({ ownerId: req.user.userId }).sort({ createdAt: -1 }),
        );
        res.json(visits.map(toVisitRequestJson));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// A single visit, for the tenant or owner involved in it
export async function getVisitById(req: AuthRequest, res: Response) {
    try {
        const visit = await populateVisit(Visits.findById(req.params.id));
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }
        const userId = req.user.userId;
        if (visit.tenantId?._id.toString() !== userId && visit.ownerId?._id.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.json(toVisitRequestJson(visit));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// Accept or Refuse a Visit (owner)
export async function visitAgrement(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.id);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        if (visit.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { status, reason } = req.body;
        // Mobile/web send 'refused', the schema enum uses 'rejected'.
        visit.status = status === 'refused' ? 'rejected' : status;
        if (visit.status === 'rejected' && reason) {
            visit.refusalReason = reason;
        }
        await visit.save();

        const populated = await populateVisit(Visits.findById(visit._id));
        res.json(toVisitRequestJson(populated));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// Cancel a still-pending visit request (tenant)
export async function cancelVisit(req: AuthRequest, res: Response) {
    try {
        const visit = await Visits.findById(req.params.id);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }
        if (visit.tenantId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (visit.status !== 'pending') {
            return res.status(400).json({ message: `Cannot cancel a ${visit.status} visit` });
        }

        await visit.deleteOne();
        res.json({ success: true, message: "Visit cancelled" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

//Get super infos of visits with populate (admin/debug: every visit, unfiltered)
export async function visitPopulate(req: AuthRequest, res: Response) {
    try {
        const superVisit = await populateVisit(Visits.find());
        res.json(superVisit.map(toVisitRequestJson));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// Stats for the connected owner: visit count per status
export async function visitsStats(req: AuthRequest, res: Response) {
    try {
        const visits = await Visits.find({ ownerId: req.user.userId });

        const stats = { total: visits.length, pending: 0, accepted: 0, refused: 0, completed: 0 };
        for (const visit of visits) {
            if (visit.status === 'pending') stats.pending++;
            else if (visit.status === 'accepted') stats.accepted++;
            else if (visit.status === 'rejected') stats.refused++;
            else if (visit.status === 'completed') stats.completed++;
        }

        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
