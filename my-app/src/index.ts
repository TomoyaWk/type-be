import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import api from './api'

const app = new Hono()

// NOT FOUND
app.notFound((c) => {
  return c.text('Custom 404 Message', 404)
})

app.route("/api", api)

const port = 3000
console.log(`Server is running on port ${port}`)

export default app

if (process.env.NODE_ENV !== 'test') {
  serve(app);
}