import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';

class Booking{
  constructor(bookingWidget){

    const thisBooking = this;

    thisBooking.render(bookingWidget);
    thisBooking.initWidget();
  }
  render(bookingWidget){

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
    console.log('datePicker', thisBooking.dom.datePicker);
  }
  initWidget(){

    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
  }
}
export default Booking;
