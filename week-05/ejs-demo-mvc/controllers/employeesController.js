const employeeUtil = require("../modules/employee-util");
const express = require("express");

const router = express.Router();

// Setup a home page route.
router.get("/", (req, res) => {
    res.render("employees/list", {
        employees: employeeUtil.getAllEmployees(),
        title: "Home Page"
    });
});

// Setup a home page route.
router.get("/list", (req, res) => {
    res.render("employees/list", {
        employees: employeeUtil.getAllEmployees(),
        title: "Home Page"
    });
});

module.exports = router;