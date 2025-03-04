const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");
const { expect } = require("chai");

let testUser = null;

let page = null;
let browser = null;

// Launch the browser and open a new blank page
describe("jobs-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
    browser = await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });

  after(async function () {
    this.timeout(5000);
    await browser.close();
  });

  describe("got to site", function () {
    it("should have completed a connection", async function () {});
  });

  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async () => {
      this.logonLink = await page.waitForSelector("a::text(Click this link to logon)");
    });
    it("gets to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
    });
  });

  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button::text(Logon)");
    });
    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(`p::text(${testUser.name} is logged on.)`);
      await page.waitForSelector("a::text(change the secret)");
      await page.waitForSelector('a[href="/secretWord"]');
      const copyr = await page.waitForSelector("p::text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });

  describe("puppeteer job operations", function () {
    it("should go to the jobs list and verify 20 entries", async () => {
      // Go to the jobs list page
      const jobsLink = await page.waitForSelector('a[href="/jobs"]');
      await jobsLink.click();
      await page.waitForNavigation();

      // Get the content of the page and count job entries
      const content = await page.content();
      const jobEntries = content.split("<tr>").length - 1; // -1 for header row
      expect(jobEntries).to.equal(20);
    });

    it("should click on Add a Job button and verify the form", async () => {
      // Click on the "Add A Job" button
      const addJobButton = await page.waitForSelector('a[href="/jobs/add"]');
      await addJobButton.click();
      await page.waitForNavigation();

      // Verify that the form contains company and position fields
      const companyField = await page.waitForSelector('input[name="company"]');
      const positionField = await page.waitForSelector('input[name="position"]');
      const submitButton = await page.waitForSelector('button[type="submit"]');

      expect(companyField).to.not.be.null;
      expect(positionField).to.not.be.null;
      expect(submitButton).to.not.be.null;
    });

    it("should add a job and verify it is added to the list", async () => {
      // Fill in the job form
      const companyField = await page.waitForSelector('input[name="company"]');
      const positionField = await page.waitForSelector('input[name="position"]');
      const submitButton = await page.waitForSelector('button[type="submit"]');

      const newJob = {
        company: "Test Company",
        position: "Test Position",
      };

      await companyField.type(newJob.company);
      await positionField.type(newJob.position);
      await submitButton.click();

      // Wait for the jobs list page to reload
      await page.waitForNavigation();

      // Verify that the new job is listed
      const jobList = await page.content();
      const jobAdded = jobList.includes(newJob.company) && jobList.includes(newJob.position);
      expect(jobAdded).to.be.true;

      // Check the database to ensure the job was added
      const jobInDb = await Job.findOne({ company: newJob.company, position: newJob.position });
      expect(jobInDb).to.not.be.null;
      expect(jobInDb.company).to.equal(newJob.company);
      expect(jobInDb.position).to.equal(newJob.position);
    });
  });
});
