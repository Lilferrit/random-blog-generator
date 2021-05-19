# *Random Blog Post* API Documentation
This api has all the necessary functionality for managing the random
blog post generator's wordbank collection.

## Save a Wordbank
**Request Format:** /save with parameters `name`, `password`, and `words`

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Either saves a new wordbank to the collection or updates the wordlist the specified
wordbank if the wordbank already exist in the collection. A password is required for both creating
a new wordbank or updating a wordbank. 

**Example Request:** /save with post parameters `name=mywords`, `password=password`, and
`words=I,Make,The,Best,Passwords`

**Example Response:**
```
Sucessfully added wordbank {name} to collection!
```
or
```
Sucessfully updated wordbank: {name}
```

**Error Handling:**
- Possible 400 errors, all of which are sent as plain text
    - If `name` is an existing wordbank and `password` does not match the existing password for
      name, the text `Given password does not match password on file for wordbank {name}` will
      be sent.


## Delete a Wordbank
**Request Format:** /delete with POST parameters `name` and `password`

**Request Type:** POST

**Returned Data Format**: Plain text

**Description:** Deletes the wordbank name from the collection if `password` matches the
password associated with the wordbank.

**Example Request:** /delete with POST parameters `name=mywords` and `password=password`

**Example Response:**
```
Successfully deleted wordbank {name}
```

**Error Handling:**
- Possible 400 errors, all of which are sent as plain text
    - If `name` is not in the wordbank collection, the response `Cannot find wordbank {name}` will
      be sent
    - If `passwrod` does not match the password associated with `name`, the response
      `Password does not match wordbank: {name}` will be sent

## Load the wordlist of a wordbank
**Request Format:** /load with query parameter `name`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves the wordlist of the wordbank with the name `name`.

**Example Request:** /load?name=mywords

**Example Response:**

```
{
    "name": "name",
    "words": ["I", "Make", "The", "Best", "Passwords"]
}
```

**Error Handling:**
- Possible 400 errors, all of which are sent as plain text
    - If no wordbank with a name of `name` can be found, then the response `No wordbank with name {name} exists.`

## Retrieve a list of all Wordbanks
**Request Format:** /wordbanks (no parameters)

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Sends a JSON object containing a list of all the wordbanks in the collection

**Example Request:** /wordbanks

**Example Response:**

```
{
    "wordBanks":["wordbank1", wordbank2", "mywords", "bob"]
}
```

**Error Handling:**
- N/A