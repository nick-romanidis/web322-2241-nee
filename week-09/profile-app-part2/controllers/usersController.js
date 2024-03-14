const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const path = require("path");

// Route to the registration page (GET /users/register)
router.get("/register", (req, res) => {
    res.render("users/register");
});

// Route to the registration page (POST /users/register)
router.post("/register", (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // TODO: Validate the information entered is correct.

    const newUser = new userModel({ firstName, lastName, email, password });

    // TODO: On the assignment, first check if the email already exists for a document.
    // WARNING: Do not throw/show any error if a duplicate email is attempted to be added.
    //          Rather, show a friendly error message in the registration form.

    newUser.save()
        .then(userSaved => {
            console.log(`User ${userSaved.firstName} has been added to the database.`);

            // Create a unique name for the picture, so that it can be stored in the static folder.
            const profilePicFile = req.files.profilePic;
            const uniqueName = `profile-pic-${userSaved._id}${path.parse(profilePicFile.name).ext}`;

            // Copy the image data to a file on the system.
            profilePicFile.mv(`assets/profile-pics/${uniqueName}`)
                .then(() => {
                    // Successful
                    // Update the document so the profile pic is populated.
                    userModel.updateOne({
                        _id: userSaved._id
                    }, {
                        profilePic: uniqueName
                    })
                        .then(() => {
                            // Successfully updated document
                            console.log("Updated the user profile pic");
                            res.redirect("/");
                        })
                        .catch(err => {
                            console.group("Error updating document... " + err);
                            res.redirect("/");
                        })
                })
                .catch(err => {
                    console.group("Error updating the user profile pic... " + err);
                    res.redirect("/");
                })
            res.redirect("/");
        })
        .catch(err => {
            console.log(`Error adding user to the database ... ${err}`);
            res.render("users/register");
        })

});

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // TODO: Validate that they are entered.

    let errors = [];

    userModel.findOne({
        email
    })
        .then(user => {
            // Completed the search (successfully)
            if (user) {
                // Found the user document
                // Compare the password submitted with the document.
                bcryptjs.compare(password, user.password)
                    .then(matched => {
                        // Done comparing the passwords.

                        if (matched) {
                            // Passwords matched.

                            // Create a new session.
                            req.session.user = user;
                            console.log("User signed in");

                            res.redirect("/");
                        }
                        else {
                            // Passwords don't match.
                            errors.push("The password didn't match");
                            console.log(errors[0]);
                            res.render("users/login", { errors });
                        }
                    })
            }
            else {
                // User document not found
                errors.push("Couldn't find the email in the database");
                console.log(errors[0]);
                res.render("users/login", { errors });
            }
        })
        .catch(err => {
            // Not able to query the database.
            errors.push("Unable to query the database: " + err);
            console.log(errors[0]);
            res.render("users/login", { errors });
        })
});

router.get("/logout", (req, res) => {
    // Clear the session from memory.
    req.session.destroy();

    // Do NOT do this
    //req.session.user = null;

    res.redirect("/");
});


module.exports = router;