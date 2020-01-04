/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.procesOrder();

      console.log('new Product:', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;
      /*generate HTML based on template*/
      const generateHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      console.log('images:', thisProduct.imageWrapper);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //  const trigger = thisProduct.element;
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(event){
      //  console.log('clicked', trigger);
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        /* find all active products */
        const activeProducts = document.querySelectorAll('.active');
        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts){
          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element){
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }

    initOrderForm(){

      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.procesOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.procesOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.procesOrder();
      });
      console.log('event', thisProduct);
    }

    procesOrder(){

      const thisProduct = this;
      let price = thisProduct.data.price;

      console.log('Price', price);

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      /* START LOOP: for each paramId in thisProduct.data.params */
      /* save the element in thisProduct.data.params with key paramId as const param */

      for(let paramId in thisProduct.data.params){

        const param = thisProduct.data.params[paramId];
        console.log('parametr:', paramId);

        /* START LOOP: for each optionId in param.options */
        /* save the element in param.options with key optionId as const option */
        for(let optionId in param.options){
          const option = param.options[optionId];

          console.log('option:', optionId);

          /* START IF: if option is selected and option is not default */
          /* add price of option to variable price */
          /* END IF: if option is selected and option is not default */
          /* START ELSE IF: if option is not selected and option is default */
          /* deduct price of option from price */

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if(optionSelected && !option.default){
            price = price + option.price;

            console.log('price not default elem:', option.price, 'price:', price);

          } else if(!optionSelected && option.default){
            price = price - option.price;

            console.log('price without default elem:', option.price, 'price:', price);
          }

          /*Display images*/

          const selectedImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          console.log('selected image:', selectedImages);

          if(optionSelected){
            for(let selectImage of selectedImages){
              selectImage.classList.add('active');}
          } else{
            for(let selectImage of selectedImages){
              selectImage.classList.remove('active');
            }
          }
        }
      }
      /* set the contents of thisProduct.priceElem to be the value of variable price */

      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = {

    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
