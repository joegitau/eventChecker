const request = require("supertest");
const app = require("../app");

test("should create a new user", async () => {
  await request(app)
    .post("/register")
    .send({
      name: "Joseph Gitau",
      email: "kajoe@live.com",
      password: "liverpol",
      phone: "+358409311996",
      address: "123 Fucj strt",
      compmay: "Karanja & Sons",
      isAdmin: true
    })
    .expect(201);
});
