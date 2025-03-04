const Job = require("../models/Job");
const { seed_db, testUserPassword } = require("../util/seed_db");
const { expect, request } = require("chai");
const faker = require("@faker-js/faker").fakerEN_US;

describe("Job CRUD Operations", function () {
  before(async () => {
    // Seed the database and get the user data
    this.test_user = await seed_db();
    
    // Get CSRF token and session cookies by logging in
    let req = request.execute(app).get("/session/logon").send();
    let res = await req;
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    
    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken")
    );

    // Log in with the seed user data
    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };
    req = request
      .execute(app)
      .post("/session/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    res = await req;

    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );

    // Ensure all cookies and CSRF tokens are set
    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
  });

  it("should get the job list and verify 20 entries", async () => {
    const req = request
      .execute(app)
      .get("/jobs")
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/json");

    const res = await req;
    expect(res).to.have.status(200);

    // Check how many <tr> elements are there (which represent each job)
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(21); // 1 header + 20 job entries
  });

  it("should add a new job entry", async () => {
    const jobData = await factory.build("job", { createdBy: this.test_user._id });
    
    const dataToPost = {
      title: jobData.title,
      description: jobData.description,
      _csrf: this.csrfToken,
    };

    const req = request
      .execute(app)
      .post("/jobs/add")
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);

    const res = await req;
    expect(res).to.have.status(200);

    const jobs = await Job.find({ createdBy: this.test_user._id });
    expect(jobs.length).to.equal(21); // There should be 21 jobs now
  });

  it("should update an existing job entry", async () => {
    const job = await Job.findOne({ createdBy: this.test_user._id });

    const updatedData = {
      title: "Updated Job Title",
      description: "Updated Job Description",
      _csrf: this.csrfToken,
    };

    const req = request
      .execute(app)
      .post(`/jobs/update/${job._id}`)
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(updatedData);

    const res = await req;
    expect(res).to.have.status(200);

    // Check if the job is updated in the database
    const updatedJob = await Job.findById(job._id);
    expect(updatedJob.title).to.equal(updatedData.title);
    expect(updatedJob.description).to.equal(updatedData.description);
  });

  it("should delete a job entry", async () => {
    const job = await Job.findOne({ createdBy: this.test_user._id });

    const req = request
      .execute(app)
      .post(`/jobs/delete/${job._id}`)
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ _csrf: this.csrfToken });

    const res = await req;
    expect(res).to.have.status(200);

    // Check if the job is deleted from the database
    const deletedJob = await Job.findById(job._id);
    expect(deletedJob).to.be.null;
  });
});
