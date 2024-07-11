import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// setup db connection
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})


const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono with prisma!')
})

// todo CRUD
app.get("/todos", async(c) => {
  /**
   * Get List
   */
  const tasks = await prisma.task.findMany({orderBy:{id: "asc"}})
  c.status(200)
  return c.json(tasks)

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
  return c.text(`created todos => id: ${created.id} title: ${created.title}`)
})

app.get("/todos/:id", async(c) => {
  /**
   * get one
   */
  const t_id:number = Number(await c.req.param("id"))
  const task = await prisma.task.findFirst({
    where: {id: t_id}
  })
  // Not Found
  if(task == null){
    return c.status(404)
  }
  c.status(200)
  return c.json(task)
}).put("/todos/:id", async(c) => {
  /**
   * Update
   */
  const t_id:number = Number(await c.req.param("id"))
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
  return c.json(updated)
}).delete("/todos/:id", async(c)=> {
  /**
   * DELETE
   */
  const t_id:number = Number(await c.req.param("id"))
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

  return c.text(`id:${del.id} todo is deleted!` )
})


const port = 3000
console.log(`Server is running on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port
})

process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  server.close();
});