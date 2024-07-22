import { Hono } from "hono";
import prisma from "./prisma"
import  * as bcrypt  from "bcryptjs"
import type { JwtVariables} from "hono/jwt";
import { jwt } from 'hono/jwt'
import { Jwt } from "hono/utils/jwt";

type Variables = JwtVariables

const api = new Hono<{ Variables: Variables}>()

//Auth
api.post("/signup", async(c)=> {
  const req = await c.req.json()
  
  const hashed = await bcrypt.hash(req?.password, 10)    
  const user = await prisma.user.create({
    data:{
      name: req?.name,
      email: req?.email,
      password: hashed,
    }
  })
      
  return c.json(user, 200)       
})

api.post("/login", async(c) => {
  try{
    const req = await c.req.json()
    const user = await prisma.user.findFirst({where: {
      email: req?.email,
    }})
      
    if (!user){ throw new Error }
    
    const isPasswordOk = bcrypt.compare(req?.password, user?.password)
    if (!isPasswordOk){ throw new Error }
    
    const payload = {
      id: user.id
    }
    //return token
    const token = await Jwt.sign(payload, "ENV_SECRET_KEY")
    return c.json({token}, 200)

  } catch {

    return c.text("authenticate failed.", 401)
  }
})


api.use("/todos/*", jwt({ secret: "ENV_SECRET_KEY" }) )
// todo CRUD
api.get("/todos", async(c) => {
    /**
     * Get List
     */
    const tasks = await prisma.task.findMany({orderBy:{id: "asc"}})
    return c.json(tasks, 200)
  
  }).post("/todos", async (c) => {
    /**
     * Create
     */  
    const req = await c.req.json()
    const created = await prisma.task.create({
      data: {
        title: req.title,
        content: req.content,
        isDone: false,
      }
    })
    return c.text(`created todos => id: ${created.id} title: ${created.title}`, 201)
  })

api.get("/todos/:id", async(c) => {
  /**
   * get one
   */
  const t_id:number = Number(c.req.param("id"))
  const task = await prisma.task.findFirst({
    where: {id: t_id}
  })
  // Not Found
  if(task == null){
    return c.text("task not found.",404)
  }
 
  return c.json(task, 200)
}).put("/todos/:id", async(c) => {
  /**
   * Update
   */
  const t_id:number = Number(c.req.param("id"))
  const req = await c.req.json()

  const task = await prisma.task.findFirst({
    where: {id: t_id}
  })
  // Not Found
  if(task == null){
    return c.status(404)
  }
  const updated = await prisma.task.update({
      where:{id: task.id},
      data: req,
  })
  return c.json(updated, 200)
}).delete("/todos/:id", async(c)=> {
  /**
   * DELETE
   */
  const t_id:number = Number(c.req.param("id"))
  const task = await prisma.task.findFirst({
    where: {
      id: t_id
    }
  })
  // Not Found
  if(task == null){
    return c.status(404)
  }
  const del = await prisma.task.delete({
    where:{id: task.id},
  })

  return c.text(`id:${del.id} todo is deleted!`, 200)
})

  
export default api