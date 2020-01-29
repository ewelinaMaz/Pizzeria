import {
  select,
  templates,
  settings,
  classNames
} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingWidget) {

    const thisBooking = this;

    thisBooking.render(bookingWidget);
    thisBooking.initWidget();
    thisBooking.getData();
    //  thisBooking.rangeSliderBG();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking +
        '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event +
        '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event +
        '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponses = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponses.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {

    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    console.log('item date', thisBooking.datePicker.maxDate);
    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          //console.log('loopDate', loopDate);
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('hourBlock', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
      //console.log('booked.table', table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    //console.log('date:', thisBooking.date);
    //console.log('date.picker', thisBooking.datePicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
      //console.log('table', table);
    }

    thisBooking.rangeSlider();
  }

  render(bookingWidget) {

    const thisBooking = this;

    const generateHTML = templates.bookingWidget();

    thisBooking.dom = {};
    //console.log('thisBooking', thisBooking.dom);
    thisBooking.dom.wrapper = bookingWidget;
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generateHTML);
    bookingWidget.appendChild(thisBooking.dom.wrapper);

    //console.log('thisBooking.dom.wrapper', thisBooking.dom.wrapper);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    //console.log('peopleAmount', thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.formSubmit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('.booking-form');
    //console.log('datePicker', thisBooking.dom.datePicker);
    //console.log('hourPicker', thisBooking.dom.hourPicker);
  }

  initWidget() {

    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    /* Add event listener to tables */
    for (let table of thisBooking.dom.tables)
      table.addEventListener('click', function() {

        table.classList.toggle(classNames.booking.tableSelect);
      });

    /* Add event listener to tables */
    thisBooking.dom.formSubmit.addEventListener('click', function(event) {
      event.preventDefault();
      thisBooking.sendBookOrder();
    });
  }

  rangeSlider() {

    const thisBooking = this;

    thisBooking.slider = thisBooking.dom.form.querySelector(select.widgets.hourPicker.rangeSlider);
    //console.log('slider', slider);

    /* Declare all const */
    const tableAmount = [];
    const colours = [];
    const hours = [];
    const startHour = settings.hours.open;
    const endHour = settings.hours.close;
    console.log('startHour', startHour);
    for (let h = startHour; h < endHour; h += 0.5) {
      hours.push(h);
    }
    /* Find booked tables for each hour */
    for (let hour of hours) {
      if (!thisBooking.booked[thisBooking.date][hour]) {
        tableAmount.push(0);
      } else {
        tableAmount.push(thisBooking.booked[thisBooking.date][hour]);
      }
      //console.log(thisBooking.booked[thisBooking.date][hour]);
    }
    //console.log('amount', tableAmount);
    /* Define color rule for booked tables */

    for (let table of tableAmount) {
      if (table.length == 3) {
        colours.push(settings.param.colours.red);
      } else if (table.length == 2) {
        colours.push(settings.param.colours.orange);
      } else
        colours.push(settings.param.colours.green);
      //console.log('table', table);
      //console.log('colours', colours);
    }

    let avg = Math.round(100 / colours.length);
    let auxiliary = Math.round(100 / colours.length);
    let begin = 0;
    const linear = [];

    for (let colour of colours) {
      linear.push(colour + ' ' + begin + '%' + ' ' + avg + '%');
      begin += auxiliary;
      avg += auxiliary;
    }

    const colorStyle = linear.join(', ');
    thisBooking.slider.style.background = 'linear-gradient(to right,' + colorStyle + ')';
  }

  sendBookOrder() {

    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      address: 'test',
      Date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      peopleAmount: thisBooking.peopleAmount.value,
      hoursAmount: thisBooking.hoursAmount.correctValue,
      starters: [],
      table: [],
      phone: thisBooking.dom.phone.value,
      adres: thisBooking.dom.address.value,

    };
    console.log('phone:', thisBooking.dom.phone);

    for (let starter of thisBooking.dom.starters)
      if (starter.checked == true) {
        payload.starters.push(starter.value);
      }

    for (let table of thisBooking.dom.tables)
      if (table.classList.contains(classNames.booking.tableSelect)) {
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if (!isNaN(tableId)) {
          tableId = parseInt(tableId);
          table.classList.remove(classNames.booking.tableSelect) &&
            table.classList.add(classNames.booking.tableBooked);
        }
        payload.table.push(tableId);
      }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResonse) {
        console.log('parsedResonse', parsedResonse);
      });
  }
}
export default Booking;
