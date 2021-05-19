/**
 * Gavin Straub
 * Section AO
 * 5/19/2021
 * TAs: Austin, Hritik
 *
 * This file contains all back-end functionality for
 * the random blog post generator. This functionality
 * includes saving wordbanks, deleting wordbanks,
 * retrieving a list of all known wordbanks,
 * and loading wordbanks.
 */

"use strict";

const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * Saves the given wordbank to the collection of wordbanks
 * If a wordbank doesn't exist in the collection, a new
 * wordbank will be added to the collection. Otherwise,
 * the existing wordbank will have it's word list updated
 * to the given wordlist
 *
 * Returns a 400 status  if the password doesn't match
 * an existing wordbank's password. Otherwise, a 200
 * status will be returned unless there is a server
 * error in which case a 500 status will be returned.
 *
 * Post paramaters:
 *  name: the name of the wordbank to be saved
 *  password: the password associated with the wordbank name
 *  words: a comma seperated of words that will become the wordlist
 *         of the wordbank name
 */
app.post("/save", async (req, resp) => {
  let words = req.body.words;
  let name = req.body.name;
  let password = req.body.password;

  try {
    let allWordBanks = await wordBankJson();
    let wordBank = allWordBanks[name];

    if (wordBank && password !== wordBank["password"]) {
      let errorText = "Given password does not match password on file for wordbank: " + name;
      resp.status(400).type("text")
        .send(errorText);
    } else {
      await updateWordBanks(allWordBanks, wordBank, name, password, words, resp);
    }
  } catch (err) {
    resp.status(500).type("text")
      .send(err);
  }
});

/**
 * Removes a given wordbank from the wordbank collection.
 *
 * Sends a 400 plain text response if the specified wordbank doesn't exist
 * in the collection or the password doesn't match the specified
 * wordbank. If an internal error occurs, a 500 status will be sent.
 * Otherwise, a status 200 plain text response will be sent.
 *
 * Post parameters:
 *  name: the name of the wordbank to deleted
 *  password: the password associated with the wordbank to be deleted
 */
app.post("/delete", async (req, resp) => {
  let name = req.body.name;
  let password = req.body.password;

  try {
    let allWordBanks = await wordBankJson();
    if (allWordBanks[name] && password === allWordBanks[name]["password"]) {
      delete allWordBanks[name];
      await fs.writeFile("words.json", JSON.stringify(allWordBanks));
      resp.status(200).type("text")
        .send("Sucessfully deleted wordbank: " + name);

    } else if (!allWordBanks[name]) {
      resp.status(400).type("text")
        .send("Cannot find wordbank: " + name);

    } else {
      resp.status(400).type("text")
        .send("Password does not match wordbank: " + name);
    }
  } catch (err) {
    resp.status(500).type("text")
      .send(err);
  }
});

/**
 * Sends the word list of a given wordbank, no password required
 *
 * Sends a status 400 plain text respone if wordbank doesn't exist
 * Sends a status 500 response if intenral error occurs
 * Sends a status 200 json response containing the wordlist if
 * process was sucessfull
 *
 * Get parameters:
 *  name: the name of the wordbank associated with the target wordlist
 */
app.get("/load", async (req, resp) => {
  let name = req.query.name;

  try {
    let allWordBanks = await wordBankJson();
    let wordBank = allWordBanks[name];

    if (wordBank !== undefined) {
      resp.status(200).type("json");
      delete wordBank["password"];
      resp.send(wordBank);
    } else {
      resp.status(400)
        .type("text")
        .send("No wordbank with name " + name + " exists.");
    }
  } catch (err) {
    resp.status(500)
      .type("text")
      .send(err);
  }
});

/**
 * Sends a list of all wordbank names
 *
 * Sends a status 500 plain text response if internal error occurs
 * Sends a status 200 json respone if process was sucessfull
 *
 * Get parameters: none
 */
app.get("/wordbanks", async (req, resp) => {
  try {
    let allWordBanks = await wordBankJson();
    let wordBankNames = Object.keys(allWordBanks);
    let wordBankArray = {};
    wordBankArray["wordBanks"] = wordBankNames;

    resp.status(200)
      .type("json")
      .send(wordBankArray);
  } catch (err) {
    resp.status(500)
      .type("text")
      .send(err);
  }
});

/**
 * Updates the file words.json with new wordbank. If name doesn't exist
 * in allWordBanks, then name will be added with word bank wordBank and
 * password password. If the wordbank does exist, then it's wordbank will
 * be updated if password mathches the associated password.
 *
 * @param {JSON} allWordBanks json object containing all wordbans
 * @param {JSON} wordBank the wordbank to be updated, set to undefined if
 *                        a new wordbank is to be created
 * @param {String} name the name of the new wordbank
 * @param {String} password the new wordbanks password or the password of the
 *                          existing wordbank name is to be added to the collection
 * @param {String} words a comma seperated list of words that will comprise the new
 *                       wordbank
 * @param {Response} resp the response to be sent to the client
 */
async function updateWordBanks(allWordBanks, wordBank, name, password, words, resp) {
  resp.status(200).type("text");

  if (wordBank) {
    wordBank["words"] = words.split(",");
    resp.send("Sucessfully updated wordbank: " + name);
  } else {
    let newWordBank = {};
    newWordBank["password"] = password;
    newWordBank["words"] = words.split(",");
    allWordBanks[name] = newWordBank;
    resp.send("Sucessfully added wordbank " + name + " to collection!");
  }

  await fs.writeFile("words.json", JSON.stringify(allWordBanks));
}

/**
 * @returns {JSON} the json object containing all wordbanks
 */
async function wordBankJson() {
  let file = await fs.readFile("words.json", "utf-8");
  return JSON.parse(file);
}

const PORT = process.env.PORT || 8000
app.use(express.static("public"));
app.listen(PORT);