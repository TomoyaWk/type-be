import app from "../src/index";
import prisma from "../src/prisma";


const initTodo = [
    { title: "テスト1", content: "コンテンツ1", isDone: false },
    { title: "テスト2", content: "コンテンツ2", isDone: false },
    { title: "テスト3", content: "コンテンツ3", isDone: false },
]

describe("TodoAPI", () => {  
    describe("GET 一覧取得", () => {
        it("正常系 一覧" , async()=>{
            //seeding
            await prisma.task.createMany({
                data: initTodo
            })  
            const res = await app.request("http://localhost:3000/api/todos", {
                method: "GET",
            })
            expect(res.status).toBe(200)

            const body = await res.json()

            expect(body.length).toBe(3)

            for (const [i, b] of body.entries()){
                expect(b.title).toBe(`テスト${i+1}`)
                expect(b.content).toBe(`コンテンツ${i+1}`)
            }
        })
    }),
    describe("GET １件取得", ()=> {
        it("正常系", async()=> {
            //seeding
            await prisma.task.createMany({
                data: initTodo
            })  
            const recent = await prisma.task.findFirst({orderBy: {createdAt: "asc"}})
            
            const res = await app.request(`http://localhost:3000/api/todos/${recent?.id}`, {
                method: "GET",
            })

            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.id).toBe(recent?.id)
            expect(body.title).toBe("テスト1")
            expect(body.content).toBe("コンテンツ1")
        })
    }),
    describe("POST 追加", ()=> {
        it("正常系", async()=> {
            const newTask = { "title" :"新規追加1", "content": "新規コンテンツ1" }
            const res = await app.request("http://localhost:3000/api/todos", {
                method: "POST",
                body: JSON.stringify(newTask)
            })
            expect(res.status).toBe(201)

            const created = await prisma.task.findFirst({orderBy: {
                createdAt: "desc"    
            }})

            expect(created?.title).toBe(newTask.title)
            expect(created?.content).toBe(newTask.content)
        })  
    }),
    describe("DELETE 削除", ()=> {
        it("正常系", async()=> {
            //seeding
            await prisma.task.createMany({
                data: initTodo
            })  
            const recent = await prisma.task.findFirst({orderBy: {createdAt: "asc"}})
            
            const res = await app.request(`http://localhost:3000/api/todos/${recent?.id}`, {
                method: "DELETE",
            })
            expect(res.status).toBe(200)

            const deleted = await app.request(`http://localhost:3000/api/todos/${recent?.id}`, {
                method: "GET",
            })
            expect(deleted.status).toBe(404)
        })
    })
    
})