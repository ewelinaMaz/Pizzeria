import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.procesOrder();

    //console.log('new Product:', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    /*generate HTML based on template*/
    const generateHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
    //console.log('thisProduct.element:', thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //  console.log('images:', thisProduct.imageWrapper);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    //  const trigger = thisProduct.element;
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      //  console.log('clicked', trigger);
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');
      /* find all active products */
      const activeProducts = document.querySelectorAll('.product');

      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm() {

    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.procesOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.procesOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.procesOrder();
      thisProduct.addToCart();
    });
    //  console.log('event', thisProduct);
  }

  procesOrder() {

    const thisProduct = this;
    thisProduct.params = {};

    let price = thisProduct.data.price;

    //console.log('Price', price);

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    /* START LOOP: for each paramId in thisProduct.data.params */
    /* save the element in thisProduct.data.params with key paramId as const param */

    for (let paramId in thisProduct.data.params) {

      const param = thisProduct.data.params[paramId];
      //console.log('parametr:', paramId);

      /* START LOOP: for each optionId in param.options */
      /* save the element in param.options with key optionId as const option */
      for (let optionId in param.options) {
        const option = param.options[optionId];
        //console.log('option:', optionId);

        /* START IF: if option is selected and option is not default */
        /* add price of option to variable price */
        /* END IF: if option is selected and option is not default */
        /* START ELSE IF: if option is not selected and option is default */
        /* deduct price of option from price */

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        if (optionSelected && !option.default) {
          price = price + option.price;

          //console.log('price not default elem:', option.price, 'price:', price);

        } else if (!optionSelected && option.default) {
          price = price - option.price;

          //console.log('price without default elem:', option.price, 'price:', price);
        }

        /*Display images*/

        const selectedImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

        //console.log('selected image:', selectedImages);

        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          for (let selectImage of selectedImages) {
            selectImage.classList.add('active');
          }
        } else {
          for (let selectImage of selectedImages) {
            selectImage.classList.remove('active');
          }
        }
      }
    }
    /*multiply price by amount*/
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    //console.log('amount:', thisProduct.amountWidget.value);
    //  price *= thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */

    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log('product.params:', thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function (event) {
      event.preventDefault();
      thisProduct.procesOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
