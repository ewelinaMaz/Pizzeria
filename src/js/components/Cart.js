import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
    //  console.log('thisCartList:', thisCart.dom);
    //  console.log('element:', element);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function (event) {
      event.preventDefault();
      thisCart.update();
      //console.log('update', thisCart);
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      event.preventDefault();
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      adress: 'test',
      totalPrice: thisCart.totalPrice,
      phone: thisCart.dom.phone,
      address: thisCart.dom.address,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResonse) {
        console.log('parsedResponse', parsedResonse);
      });
  }

  add(menuProduct) {
    const thisCart = this;

    const generateHTML = templates.cartProduct(menuProduct);
    const generateDOM = utils.createDOMFromHTML(generateHTML);
    thisCart.dom.productList.appendChild(generateDOM);

    thisCart.products.push(new CartProduct(menuProduct, generateDOM));

    thisCart.update();
    //console.log('adding product:', menuProduct);
  }

  update() {

    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    for (thisCart.product of thisCart.products) {
      thisCart.subtotalPrice += thisCart.product.price;
      thisCart.totalNumber += thisCart.product.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    //console.log('totalNumber:', thisCart.totalNumber);
    //console.log('subtotalPrice:', thisCart.subtotalPrice);
    //console.log('CartProduct', thisCart.products);
    //console.log('totalPrice:', thisCart.totalPrice);
    //console.log('deliveryFee:', thisCart.deliveryFee);

    for (let key of thisCart.renderTotalsKeys) {
      //console.log('key', key);
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
        //console.log('elem', elem);
      }
    }
  }

  remove(cartProduct) {

    const thisCart = this;
    const index = thisCart.products.indexOf['cartProduct'];

    //console.log('cartProduct', index);

    thisCart.products.splice(index, 1);

    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }
}
export default Cart;
