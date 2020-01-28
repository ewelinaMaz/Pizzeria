import {
  settings,
  select,
  classNames
} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.homeLinks = document.querySelectorAll(select.home.links);

    const idFromHash = window.location.hash.replace('#/', '');


    let pageMachingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMachingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMachingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        //console.log('navLinks', thisApp.navLinks);
        /* Get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id*/
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
    /*Get links from Home side gallery */
    for (let link of thisApp.homeLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        console.log('homeLinks', thisApp.homeLinks);
        /* Get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id*/
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function(pageId) {
    const thisApp = this;
    /* add class "active" to matching pages, remove from non-matching class active */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class "active" to matching links, remove from non-matching  */
    for (let link in thisApp.navlinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
    /* add class "active" to matching links, remove from non-matching  (homepage)*/
    for (let link of thisApp.homeLinks) {
      link.classList.toggle(classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function() {
    const thisApp = this;

    //  console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        //console.log('parseResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
  },

  initBooking: function() {
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);
    //console.log('bookingWidget', bookingWidget);

    thisApp.bookingWidget = new Booking(bookingWidget);
  },

  init: function() {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initCarousel();
  },

  initCart: function() {

    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    //console.log('cart elem:', cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initCarousel: function() {

    var elem = document.querySelector('.main-carousel');
    //eslint-disable-next-line no-undef
    var flkty = new Flickity(elem, {
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      prevNextButtons: true,
      pageDots: true,
      autoPlay: 3000,
      friction: 0.5,
    });
    console.log('flkty:', flkty);
  },
};

app.init();
