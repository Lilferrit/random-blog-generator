/**
 * Gavin Straub
 * Section AO
 * 5/5/2021
 * TAs: Austin, Hritik
 *
 * Updated 5/5/2021
 * Updated 5/17/2021
 *
 * This is responsible for all the front-end
 * functionality of the random blog generator.
 * This entails sending save, load, delete, and show
 * list request to the server, interacting with imgflip's
 * memes API, and randomly generating blog post elements
 * based on the words that the user has staged in the wordbank.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * Runs as soon as DOM is loaded
   * Adds event listeners to all buttons on the page
   * and to the initial wordbank input field
   */
  function init() {
    id("gen-title").addEventListener("click", generateTitle);
    id("more-words").addEventListener("click", generateInput);
    id("gen-paragraph").addEventListener("click", generateParagraph);
    id("gen-list").addEventListener("click", generateList);
    id("gen-header").addEventListener("click", generateHeader);
    id("gen-meme").addEventListener("click", generateMeme);
    id("save-wordbank").addEventListener("click", saveWords);
    id("delete-wordbank").addEventListener("click", deleteWords);
    id("load-wordbank").addEventListener("click", loadWords);
    id("clear-wordbank").addEventListener("click", clearWordBank);
    id("load-list").addEventListener("click", getWordBankList);

    addRemoveEvent();
  }

  /**
   * Clears the wordbank of all words and adds
   * a fresh input field to the wordbank
   */
  function clearWordBank() {
    let words = document.querySelectorAll("#wordbank input");
    words.forEach(word => word.remove());

    let newInput = document.createElement("input");
    id("wordbank").insertBefore(newInput, document.querySelector("#wordbank div"));
    addRemoveEvent();
  }

  /**
   * Fetches a list of all avaulable wordbanks
   * and displays the list in a human readable
   * form (See updateWordBankList)
   */
  async function getWordBankList() {
    let wordBankJson;
    try {
      let response = await fetch("/wordbanks");
      await statusCheck(response);
      wordBankJson = await response.json();
    } catch (err) {
      addErrorMessage(err);
    }

    updateWordBankList(wordBankJson, this);
  }

  /**
   * Displays a list of available wordbanks within
   * the parent element of refreshButton
   * @param {Json} wordBankJson a json object containing the wordbank list
   *                            as a stringlist at key "wordBanks"
   * @param {Node} refreshButton the button whose parent element
   *                             will host the list
   */
  function updateWordBankList(wordBankJson, refreshButton) {
    let listContainer = refreshButton.parentElement;
    let wordBanks = wordBankJson["wordBanks"];
    let wordBankList = document.createElement("ul");

    listContainer.innerHTML = "";
    let newHeader = document.createElement("h3");
    newHeader.textContent = "Word Bank List";
    listContainer.appendChild(newHeader);

    for (let i = 0 ; i < wordBanks.length; i++) {
      let nextWordBank = document.createElement("li");
      nextWordBank.textContent = wordBanks[i];
      wordBankList.appendChild(nextWordBank);
    }

    listContainer.appendChild(wordBankList);
    let newButton = document.createElement("button");
    newButton.textContent = "Refresh Word Bank List";
    newButton.addEventListener("click", getWordBankList);
    listContainer.appendChild(newButton);
  }

  /**
   * Adds the dblclick to remove event to all input
   * fields in the wordbank
   */
  function addRemoveEvent() {
    let wordBank = document.querySelectorAll("#wordbank input");

    for (let i = 0; i < wordBank.length; i++) {
      wordBank[i].addEventListener("dblclick", function() {
        wordBank[i].remove();
      });
    }
  }

  /**
   * Adds a new input field to the word bank
   */
  function generateInput() {
    let wordBank = id("wordbank");
    let newWord = document.createElement("input");

    // Insert the new word input field as the second to last child
    wordBank.insertBefore(newWord, wordBank.lastChild.previousSibling);
    addRemoveEvent();
  }

  /**
   * Grabs all words in the wordbank
   * @returns {list} a list containing all words in the wordbank (lower case)
   *                 the list will be empty if the user has no words entered
   *                 in the wordbank
   */
  function getWords() {
    let wordBank = document.querySelectorAll("#wordbank input");
    let wordList = [];

    for (let i = 0; i < wordBank.length; i++) {
      if (wordBank[i].value !== "") {
        wordList[i] = wordBank[i].value.toLowerCase();
      }
    }

    clearMessages(true);
    if (wordList.length === 0) {
      addErrorMessage("Wordbank may not be empty!");
    }

    return wordList;
  }

  /**
   * If the user has entered a name and password:
   * Sends a delete request to delete the user specified
   * wordbank
   */
  function deleteWords() {
    if (verifyInput()) {
      let params = new FormData();
      params.append("name", id("wordbank-name").value);
      params.append("password", id("wordbank-password").value);
      clearMessages(true);

      fetch("/delete", {method: "POST", body: params})
        .then(statusCheck)
        .then(resp => resp.text())
        .then(text => displayResponse(text, this))
        .catch(addErrorMessage);
    }
  }

  /**
   * If the user has entered a name and password:
   * Sends a save request to save the user specified wordbank,
   * and displays the response from the server (see displayResponse)
   */
  function saveWords() {
    if (verifyInput()) {
      let words = getWords();

      if (words.length !== 0) {
        let params = new FormData();
        params.append("words", words);
        params.append("name", id("wordbank-name").value);
        params.append("password", id("wordbank-password").value);

        fetch("/save", {method: "POST", body: params})
          .then(statusCheck)
          .then(resp => resp.text())
          .then(text => displayResponse(text, this))
          .catch(addErrorMessage);
      }
    }
  }

  /**
   * Displays an error message if the user has not entered a name or password
   * @returns {Boolean} true if the user has entered a username and
   *                    password, false otherwise
   */
  function verifyInput() {
    let name = id("wordbank-name").value;
    let password = id("wordbank-password").value;

    // empty strings evaluate to false, thanks Javascript!
    if (!name && password) {
      addErrorMessage("Wordbank name required!");
    } else if (!password && name) {
      addErrorMessage("Wordbank password required!");
    } else {
      addErrorMessage("Wordbank name and password required!");
    }

    return (name && password);
  }

  /**
   * Loads the user speciefied wordbank to the clien side
   * wordbank workspace, and displays the response from
   * the server (see displayResponse)
   */
  function loadWords() {
    let name = id("load-name").value;
    clearMessages(true);

    fetch("/load?name=" + name)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(updateWordbank)
      .catch(addErrorMessage);
  }

  /**
   * Displays a the given text (intended for request responses) in
   * green with the parent element of button
   * @param {String} text the text to be displayed to the user
   * @param {Node} button the button whose parent element will host the
   *               text
   */
  function displayResponse(text, button) {
    clearMessages(false);

    let newMessage = document.createElement("p");
    newMessage.textContent = text;
    newMessage.classList.add("green");
    button.parentElement.parentElement.appendChild(newMessage);
  }

  /**
   * Updates the wordbank with new words
   * @param {StringList} wordList the list of words that will compose
   *                     the new wordbank
   */
  function updateWordbank(wordList) {
    let wordBank = id("wordbank");
    let buttons = document.querySelector("#wordbank div");
    let oldWords = document.querySelectorAll("#wordbank input")
    
    oldWords.forEach(wordBox => wordBox.remove());

    for (let i = 0; i < wordList["words"].length; i++) {
      let newWord = document.createElement("input");
      newWord.value = wordList["words"][i];
      wordBank.insertBefore(newWord, buttons);
    }

    addRemoveEvent();
  }

  /**
   * Generates a random "sentence" containing random words from
   * the wordbank. If heading is true, all the words in the sentence will
   * be capitilized and there will be no trailing period. Otherwise,
   * only the first word will be capitilized and no period will be added.
   *
   * @param {int} min the minimum number of words in the sentence
   * @param {int} max the maximum number of words in the sentence
   * @param {boolean} heading whether the sentence will be the text in the heading
   * @returns {string} a string containing the random sentence
   */
  function generateSentence(min, max, heading) {
    let sentenceLength = randomInt(min, max);
    let sentenceText = "";
    let wordList = getWords();
    let firstWord = true;

    for (let i = 0; i < sentenceLength; i++) {
      // Exclude endpoint to avoid out of bounds error
      let nextIndex = randomInt(0, wordList.length, false);
      let nextWord = wordList[nextIndex];

      /**
       * Slice function tutorial:
       * https://www.w3schools.com/jsref/jsref_slice_array.asp
       *
       * String methods tutorial:
       * https://www.w3schools.com/js/js_string_methods.asp
       */
      if (firstWord || heading) {
        nextWord = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
      }

      nextWord = " " + nextWord;
      sentenceText += nextWord;
      firstWord = false;
    }

    // Remove space at beginning of sentence
    sentenceText = sentenceText.slice(1);
    if (!heading) {
      sentenceText = addRandomPunctuation(sentenceText);
    }

    return sentenceText;
  }

  /**
   * Randomly (but not equally) adds a !, ?, or . to the end of sentenceText
   * @param {String} sentenceText the string which random punctuation will
   *                 be added to
   * @returns {String} the string with random punctuation.
   */
  function addRandomPunctuation(sentenceText) {
    let randomPunctuation = randomInt(1, 10, true);
    if (randomPunctuation === 10) {
      sentenceText += "! ";
    } else if (sentenceText === 9) {
      sentenceText += "? ";
    } else {
      sentenceText += ". ";
    }

    return sentenceText;
  }

  /**
   * Generates a random title containing up to seven words
   * from the wordbank. All words will be capitilized
   * and wil contain no period.
   */
  function generateTitle() {
    clearMessages(true);
    const minWords = 4;
    const maxWords = 8;
    let titleText = generateSentence(minWords, maxWords, true);
    let title = document.createElement("h1");

    title.textContent = titleText;
    this.parentElement.appendChild(title);
    title.addEventListener("dblclick", removeTitle);
    this.remove();
  }

  /**
   * On the user double clicking the title of the blog, the title
   * will be removed and a new generate tile button will be added
   * in the titles place.
   */
  function removeTitle() {
    let header = this.parentElement;
    this.remove();

    let newButton = document.createElement("button");
    newButton.textContent = "Generate New Title";

    header.appendChild(newButton);
    newButton.addEventListener("click", generateTitle);
  }

  /**
   * Generates a paragraph containing between 7 and 15 sentences.
   * The sentences will have between 5 and 10 words.
   */
  function generateParagraph() {
    clearMessages(true);
    const minSentences = 7;
    const maxSentences = 15;
    const minWords = 5;
    const maxWords = 10;
    let paragraphLength = randomInt(minSentences, maxSentences, true);
    let paragraphText = "";

    for (let i = 0; i < paragraphLength; i++) {
      paragraphText += generateSentence(minWords, maxWords, false);
    }

    let newParagraph = document.createElement("p");
    newParagraph.textContent = paragraphText;

    insertBlogElement(newParagraph);
  }

  /**
   * Generates a random unordered list of up to seven elements and appends it to the
   * article element. Also adds dblclick to remove element event.
   */
  function generateList() {
    clearMessages(true);
    const minItems = 3;
    const maxItems = 7;
    let listSize = randomInt(minItems, maxItems, true);
    let list = document.createElement("ul");

    // add listSize number of li tags to list
    for (let i = 0; i < listSize; i++) {
      let newItem = document.createElement("li");
      let itemContent = generateSentence(minItems, maxItems, true);

      newItem.textContent = itemContent;
      list.appendChild(newItem);
    }

    insertBlogElement(list);
  }

  /**
   * Generates a section header of heading level h2 and adds
   * it to the article element below the header. The header
   * will contain between 4 and 8 words. Also adds dblclick
   * to remove element event.
   */
  function generateHeader() {
    clearMessages(true);
    let newHeader = document.createElement("h2");
    const maxWords = 8;
    const minWords = 4;
    newHeader.textContent = generateSentence(minWords, maxWords, true);
    newHeader.addEventListener("click", addMarque);

    insertBlogElement(newHeader);
  }

  /**
   * Grabs a random meme template, captions it with a random sentence from
   * the wordbank, and adds the meme to the blog
   */
  async function generateMeme() {
    clearMessages(true);
    const url = "https://api.imgflip.com/caption_image";
    const username = id("img-username").value;
    const password = id("img-password").value;

    try {
      let randMeme = await generateMemeTemplate();
      let memeData = url;

      memeData += "?username=" + username;
      memeData += "&password=" + password;
      memeData += "&template_id=" + randMeme["id"];

      const minWords = 4;
      const maxWords = 8;

      memeData += "&text0=" + generateSentence(minWords, maxWords, true).replace(" ", "+");
      memeData += "&text1=" + generateSentence(minWords, maxWords, true).replace(" ", "+");

      let response = await fetch(memeData);
      let json = await response.json();
      if (postStatusCheck(json)) {
        addMeme(json["data"], randMeme);
      }
    } catch (err) {
      addErrorMessage(err);
    }
  }

  /**
   * Requests a list of popular memes and grabs a random meme from that list
   * @returns {String} the id string of the selected meme
   */
  async function generateMemeTemplate() {
    try {
      let response = await fetch("https://api.imgflip.com/get_memes");
      await statusCheck(response);
      let json = await response.json();

      let randMemeIndex = randomInt(0, json["data"]["memes"].length, false);
      let randMeme = json["data"]["memes"][randMemeIndex];
      return randMeme;
    } catch (err) {
      addErrorMessage(err);
    }
  }

  /**
   * Checks the reponse of a fetch request to make sure the template
   * request executes properly. Throws error if the response code
   * isn't OK
   * @param {Response} response the response to be checked for errors
   * @returns {Response} the unmodified response, returned only if
   *                     the response was OK
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw await response.text();
    } else {
      return response;
    }
  }

  /**
   * Checks the response of the fetch request for the caption_meme request
   * If response is not successfull will add error message
   * @param {JSON} response the response to the caption_meme post request
   * @returns {boolean} true if response was successfull, false otherwise
   */
  function postStatusCheck(response) {
    let isSucess = response["success"];
    if (!isSucess) {
      addErrorMessage("Generate Meme Error: " + response["error_message"]);
    }
    return isSucess;
  }

  /**
   * Adds a meme to the blog
   * @param {JSON} memeData the json data of the captioned meme
   * @param {JSON} templateData the json data of the meme template, necessary for adding an
   *               alt tag to the meme image
   */
  function addMeme(memeData, templateData) {
    let image = document.createElement("img");
    image.src = memeData["url"];
    image.alt = templateData["name"];
    insertBlogElement(image);
  }

  /**
   * Adds a red error message above the wordbank
   * @param {String} warning the text to be displayed in the error message
   */
  function addErrorMessage(warning) {
    // Filter any errors that are not usefull to the end user
    console.log(warning);
    if (!warning.includes("typerror")) {
      let header = document.querySelector("main > header");

      let warningText = document.createElement("p");
      warningText.classList.add("red");
      warningText.textContent = warning;

      // Off-brand insert after implementation
      let wordBankLabel = document.querySelector("section h2");
      let parent = wordBankLabel.parentElement;
      parent.insertBefore(warningText, wordBankLabel.nextSibling.nextSibling);
    }
  }

  /**
   * Deletes specified messages from the page
   * @param {boolean} isError whether it is desired for error messages to be removed
   */
  function clearMessages(isError) {
    let messages;
    if (isError) {
      messages = document.querySelectorAll(".red");
    } else {
      messages = document.querySelectorAll(".green")
    }
    
    for (let i = 0; i < messages.length; i++) {
      messages[i].remove();
    }
  }

  /**
   * Adds the double click to remove event listener and adds the single
   * click to switch font to text elements
   * @param {Node} element the dom element to be inserted into the blog
   */
  function insertBlogElement(element) {
    element.addEventListener("dblclick", removeElement);

    /**
     * nodeName tutorial:
     * https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
     */
    if (element.nodeName === "P" || element.nodeName === "UL") {
      element.addEventListener("click", toggleComicSans);
    }

    let blog = document.querySelector("article");
    blog.appendChild(element);
  }

  /**
   * Removes an element
   * can only be used on event listeners
   */
  function removeElement() {
    this.remove();
  }

  /**
   * Changes the target elements font
   * to comic-nua
   */
  function toggleComicSans() {
    this.classList.toggle("comic-sans");
  }

  /**
   * Wraps the target element in a marque tag
   *
   * marquee tutorial:
   *
   * https://www.w3schools.in/html-tutorial/marquee-tag/
   */
  function addMarque() {
    let parent = this.parentElement;
    let newHeader = document.createElement("h2");
    newHeader.textContent = this.textContent;

    let marquee = document.createElement("marquee");
    marquee.addEventListener("dblclick", removeElement);
    marquee.appendChild(newHeader);
    parent.replaceChild(marquee, this);
  }

  /**
   * Gives a random integer between one and max
   * Math methods tutorial:
   *
   * https://www.w3schools.com/js/js_math.asp
   *
   * @param {int} min the minimum value of the random integer
   * @param {int} max the maximum value of the random integer
   * @param {boolean} include whether the max is a possible return value
   * @returns {integer} an integer between one and max, where max is included if include
   *                    is true
   */
  function randomInt(min, max, include) {
    if (include) {
      max += 1;
    }
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Wrapper function for getElementById
   * Helper function from lecture
   * @param {String} elementId the id of the target element
   * @returns {Node} the dom element with id elementId
   */
  function id(elementId) {
    return document.getElementById(elementId);
  }
})();
/**
 * Congrats on making this far! Just to think that number of lines in this
 * file has doubled since the initial version of random blogpost generator
 */