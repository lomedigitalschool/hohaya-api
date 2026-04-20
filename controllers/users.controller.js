import Users from '../models/Users.js'



export async function findUsers(req,res) {
    try {
        const users = await Users.find()
        res.json(users)
    } catch (error) {
        res.status(500).json({error:error.message })
    }
}


export async function createUsers(req,res) {
    try {
  const user = await Users.create(req.body)
    res.json(user)

  }catch (err) {
    res.status(500).json({ error:err.message })
  }
}

export async function userProfile(req,res) {
  res.json({ user:req.user })
}


