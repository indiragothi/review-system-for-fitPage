const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model.js");
const { generateTokenAndSetCookie } = require("../utils/generateToken.js");

const handleSignUp = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, role} = req.body;

		if (password !== confirmPassword) {
			res.status(400).redirect("signup", { error: "password don't match" });
		}

        const user = await User.findOne({ email });

		if (user) {
			res.status(400).redirect("signup", { error: " email already exist " });
		}

        // HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName,
			email,
			password : hashedPassword,
            role,
		});

        if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			// res.status(201).json({
			// 	_id: newUser._id,
			// 	fullName: newUser.fullName,
			// 	email: newUser.email,
            //  role: newUser.role,	 
			// });
            res.status(201).redirect("signin");
		} else {
			res.status(400).redirect("signup", { error: " user don't create" });
		}
    } catch (error) {
        console.log("Error in signup controller", error.message);
	    res.status(500).redirect("signup", { error: "Internal Server Error" });
    }
};

const handleSignIn = async (req, res) => {
    try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			res.status(400).redirect("signin", { error: "Invalid email or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		// res.status(200).json({
		// 	_id: user._id,
		// 	fullName: user.fullName,
		// 	email: user.email,
        //     role: user.role,
		// });
        res.status(201).redirect("/");
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).redirect("signin", { error: "Internal Server Error" });
	}
};

const handleLogOut = async (req, res) => {
    res.clearCookie("jwt").redirect("/");
};

module.exports = { handleSignIn, handleSignUp, handleLogOut };
