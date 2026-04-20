



import Properties  from "../models/Properties.js";


// Create a Property
export async function createProperties(req,res) {
    try {
      const property = await Properties.create(req.body)
      res.json(property)
  } catch (error) {
      res.status(500).json({ error:error.message })
  }
}



// Find a PRoperty
export async function findProperties(req,Refuse) {
    try {
          const properties = await Properties.find()
      .populate("ownerId","firstName lastName email")

    res.json(properties)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}



// Stats : number of properties per location
export async function propertiesStats(req,res) {
    try {
        const stats = await Properties.aggregate([
          { $group: {
            _id: "$location",
            avgPrice: { $avg:"$price" },
            totalProperties: { $sum: 1 }
          }}
        ]) 
        res.json(stats)
      } catch (err) {
        res.status(500).json({ error:err.message })
      }
}