const request = require('request');
const jsdom = require('jsdom');
const Text = require('jsdom/lib/jsdom/living/generated/Text');
const { JSDOM } = jsdom;

function putProperty(tempEvent, values, label, i) {
  switch (label.innerHTML) {
  case 'Veranstaltungsname:':
    tempEvent.title = values[i].innerHTML;
    break;
  case 'Personen:':
    tempEvent.persons = values[i].innerHTML;
    break;
  case 'Ressourcen:':
    tempEvent.ressources = values[i].innerHTML;
    break;
  }
}

/* Applies hours and minutes (e.g 08:00) from srcMoment to a clone */
function applyMoment(srcMoment, time) {
  let mmt = srcMoment.clone();
  let split = time.split(':');

  mmt.set('hours', parseInt(split[0]));
  mmt.set('minutes', parseInt(split[1]));

  return mmt;
}

function putDates(tempEvent, tempMoment, anchorElement) {
  let time = '99:99-99:99';
  const firstElNode = anchorElement.firstChild;
  if (typeof firstElNode === typeof Text) {
    time = firstElNode.textContent.substring(0,5).concat(firstElNode.textContent.substring(6));
  } else {
    if (firstElNode.querySelectorAll('span.class=link')) {
      putDates(firstElNode);
    } else {
      time = '08:00-18:00';
    }
  }

  console.log(`time: ${time}`);

  let times = time.split('-');
  tempEvent.startDate = applyMoment(tempMoment, times[0]).format('HH:mm DD.MM.YYYY');
  tempEvent.endDate = applyMoment(tempMoment, times[1]).format('HH:mm DD.MM.YYYY');
}

function addEvent(events, tempMoment, anchorElement) {
  let tempEvent = {};

  // Write the time
  putDates(tempEvent, tempMoment, anchorElement);

  // Write the details
  let labels = anchorElement.querySelectorAll('span.tooltip table.infotable tbody tr td.label');
  let values = anchorElement.querySelectorAll('span.tooltip table.infotable tbody tr td.value');
  labels.forEach((label, i) => putProperty(tempEvent, values, label, i));

  events.push(tempEvent);
}

function fetchWeek(url, moment, onDone, onError, sharedObj) {
  let events = [], tempMoment = moment.clone();

  request(`${url}&day=${moment.date()}&month=${moment.month()+1}&year=${moment.year()}`, (err, res, body) => {
    if (err && onError) return onError(err);
    const { document } = new JSDOM(body).window;
    let weekTableRows = document.querySelectorAll('table.week_table > tbody > tr');
    weekTableRows.forEach(tr => {
      tr.childNodes.forEach(td => {
        if (td.className === 'week_block') {
          addEvent(events, tempMoment, td.querySelector('a'));
        } else if (td.className === 'week_separatorcell') {
          tempMoment.add(1, 'days');
        }
      });
      // reset date here
      tempMoment = moment.clone();
    });
    sharedObj[moment.format('DD.MM.YYYY')] = events;
    onDone();
  });
}

function fetchWeeks(url, startMoment, endMoment, onDone, onError) {
  let weekPromises = [], sharedObj = {};
  // to monday
  startMoment.set('day', 1);
  endMoment.set('day', 1);
  do {
    weekPromises.push(new Promise(
      (resolve, reject) => fetchWeek(url, startMoment.clone(), resolve, reject, sharedObj)
    ));
    startMoment.add(7, 'days');
  } while (!startMoment.isAfter(endMoment));

  Promise.all(weekPromises).then(() => { onDone(sharedObj); }).catch(onError);
}

exports.fetchWeeks = fetchWeeks;
