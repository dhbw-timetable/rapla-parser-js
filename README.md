# rapla-parser-js
A simple parser for the rapla timetable system. It is written in javascript and uses jsdom, request and moment.js.

## Usage
The rapla-parser-js module is available via npm.
```
$ npm install rapla-parser-js
```
Afterwards you will be able to fetch your events through providing a rapla link:
```
var parser = require("rapla-parser-js");
var moment = require("moment");

parser.fetchWeeks(
  "https://rapla.dhbw-stuttgart.de/rapla?key=abcd1234YourRaplaLink56789wxyz",
  moment("2018-01-01"), // start date
  moment("2019-01-01"), // end date
  (events) => {
    // Do what ever you want...
    console.log(events);
  },
  (err) => {
    console.error(err);
  }
);

```
