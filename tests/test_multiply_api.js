const { app } = require("../app");
const get_chai = require("../util/get_chai");

describe("test multiply API", function () {
  it("should multiply two numbers", async () => {
    const { expect, request } = await get_chai();

    const res = await request(app).get("/multiply").query({ first: 7, second: 6 });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("result");
    expect(Number(res.body.result)).to.equal(42); // Convert result to number
  });
});
