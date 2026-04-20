
import Properties from "../models/Properties.js";
import Visits from "../models/Visits.js";



// Creat Visits
export async function createVisits(req,res) {
    try {
          const { propertyId, visitDate, message } = req.body
    
          // récupérer la propriété
          const property = await Properties.findById(propertyId)
    
      if (!property) {
        return res.status(404).json({ message:"Property not found" })
            }
    
        const visit = await Visits.create({
              propertyId,
              tenantId:req.user.userId,
              ownerId:property.ownerId,
              visitDate,
              message
            })
    
        res.json(visit)
    
          }catch (err) {
            res.status(500).json({ error:err.message })
          }
}




//Find Tenant Visits
export async function findTenantVisits(req,res) {
    const visits = await Visits.find({
            tenantId : req.user.userId
          })
    
          .populate("propertyId")
          .populate("ownerId","firstName lastName")
    
          res.json(visits)
}



// Find Visits of Owner
export async function findOwnerVisits(req,res) {
    const visits = await Visits.find({
              ownerId : req.user.userId
            })
    
          .populate("propertyId")
          .populate("tenantId","firstName email")
    
          res.json(visits)
}


// Accept or Refuse a Visit
export async function visitAgrement(req,res) {
    const visit = await Visits.findById(req.params.id)
    
        if (!visit) {
        return res.status(404).json({ message:"Visit not found" })
            }
    
        // vérifier que c’est le bon propriétaire
        if (visit.ownerId.toString() !== req.user.userId) {
              return res.status(403).json({ message:"Forbidden" })
            }
    
        visit.status = req.body.status
        await visit.save()
    
          res.json(visit)
}



//Get super infos of visits with popuplate 
export async function visitPopulate(req,res) {
    try {
       const superVisit = await Visits.find()
      .populate({
          path:"propertyId",
          select:"title price location"
        })
      .populate({
          path:"tenantId",
          select:"firstName email"
        })
    
        res.json(superVisit)
    } catch (err) {
      res.status(500).json({ error:err.message })
    }
}






// Stats : number of visits per property
export async function visitsStats(req,res) {
  try {
          const visitsStats = await Visits.aggregate([
      {
        $group: {
          _id:"$propertyId",
          totalVisits: { $sum:1 }
        }
      }
    ])
    res.json(visitsStats)
      }catch (err) {
        res.status(500).json({ error:err.message })
      }
}