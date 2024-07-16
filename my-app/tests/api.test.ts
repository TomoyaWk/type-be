import app from "../src/index";
import prisma from "../src/prisma";



const initTodo = [
    { id:1, title: "テスト1", content: "コンテンツ1", isDone: false },
    { id:2, title: "テスト2", content: "コンテンツ2", isDone: false },
    { id:3, title: "テスト3", content: "コンテンツ3", isDone: false },
]

describe("TodoAPI", () => {    
    describe("GET 一覧取得", () => {
        it("正常系 一覧" , async()=>{
            //seeding
            const t  = await prisma.task.createMany({
                data: initTodo
            })
            
            const res = await app.request("http://localhost:3000/api/todos", {
                method: "GET",
            })
            expect(res.status).toBe(200)

            const body = await res.json()
    

            expect(body.length).toBe(3)

            for (const [i, b] of body.entries()){
                expect(b.id).toBe(i+1)
                expect(b.title).toBe(`テスト${i+1}`)
                expect(b.content).toBe(`コンテンツ${i+1}`)
            }
        })
    }),
    describe("GET １件取得", ()=> {
        it("正常系", async()=> {
            const t  = await prisma.task.createMany({
                data: initTodo
            })
            const res = await app.request("http://localhost:3000/api/todos/1", {
                method: "GET",
            })
            
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.id).toBe(1)
            expect(body.title).toBe("テスト1")
            expect(body.content).toBe("コンテンツ1")
        })
    })
})