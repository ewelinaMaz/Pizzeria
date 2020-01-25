import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {
  select,
  settings
} from '../settings.js';

class DatePicker extends BaseWidget {

  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.datePicker.input);
    //console.log('dom input:', thisWidget.value);
    thisWidget.initPlugin();
  }

  initPlugin() {

    const thisWidget = this;

    /* creating min and max property and converting them to string  */

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate,
      settings.datePicker.maxDaysInFuture);

    //console.log('minDate:', thisWidget.minDate);
    //console.log('maxDate:', thisWidget.maxDate);

    //eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {

      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: function(dateStr) {
        thisWidget.value = dateStr;
      },
    });
  }
  /* Add converting date method */
  parseValue(value) {
    return utils.dateToStr(utils.addDays(value[0], 1));
  }

  isValid() {
    return true;
  }

  renderValue() {}
}

export default DatePicker;
