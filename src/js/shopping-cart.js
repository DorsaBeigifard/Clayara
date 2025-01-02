const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const ptoductsList = document.querySelector(".products__list");

const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");

const cartContent = document.querySelector(".cart__content");

const clearCart = document.querySelector(".clear-cart");

import { productsData } from "./products.js";

let cart = [];
let buttonsDOM = [];

//1- get products
//* you can either import it or get it from api end points - from backend

class Products {
  getProducts() {
    return productsData;
  }
}

//2- display products
class UI {
  displayProducts(products) {
    //display new ones first!
    const sortedProducts = products.sort((a, b) => b.isNew - a.isNew);

    let result = "";
    products.forEach((item) => {
      result += `<div class="product">
                <div class="product__image">
                  <img src="${item.imageUrl}" alt="" />
                  <div class="tags">
                  ${item.isNew ? `<p class="tags__new">New</p>` : ""}
                  </div>
                </div>
                <div class="product__details">
                  <h2>${item.title}</h2>
                  <h3>${item.category}</h3>
                  <div class="price-details d-flex between-lg middle-lg">
                    <p class="price">$${item.price}</p>
                    <button class="btn btn__outline add-btn" data-id = ${
                      item.id
                    }>Add to cart</button>
                  </div>
                </div>
              </div>`;
    });

    ptoductsList.innerHTML = result;
  }

  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-btn")]; //node list to array

    buttonsDOM = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;

      // is the product in the cart ?
      const isInCart = cart.find((item) => item.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "Added";
        btn.disabled = true;
      }

      //   if it's not in the cart:
      btn.addEventListener("click", (e) => {
        e.target.innerText = "Added";
        btn.disabled = true;

        // 1- Get the product from local storage
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };

        // 2- Add to cart array(spread product details into the cart object)
        cart.push(addedProduct); // distructured to only have one object in this array
        console.log("Cart after adding product:", cart);
        // 3- Save cart to local storage
        Storage.saveCart(cart);
        //4- update Cart value (price... )
        //5- add to Cart-items number
        this.setCartValue(cart);
        //6- show the added item in cart:
        this.showItemInCart(addedProduct);
      });
    });
  }

  setCartValue(cart) {
    //1- calculate cart items number
    //2- calculate total price

    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, cur) => {
      tempCartItems += cur.quantity;
      return acc + cur.price * cur.quantity;
    }, 0);

    cartTotal.innerText = `$${totalPrice.toFixed(2)}`;
    cartItems.innerText = tempCartItems;
  }

  showItemInCart(product) {
    const div = document.createElement("div");
    div.classList.add("cart__item", "d-flex", "between-lg", "middle-lg");
    div.innerHTML = `<div class="item__details d-flex middle-lg">
              <img
                src="${product.imageUrl}"
                alt="item"
                class="cart__item-img"
              />
              <div class="cart__item-description">
                <h4>${product.title}</h4>
                <h5>$${product.price}</h5>
              </div>
            </div>
            <div class="item__controller d-flex middle-lg">
              <div class="item__amount d-flex column middle-lg">
                <i class="fa-solid fa-chevron-up" data-id=${product.id}></i>
                <p>${product.quantity} </p>
                <i class="fa-solid fa-chevron-down" data-id=${product.id}></i>
              </div>
              <div class="item__delete">
              <i class="fa-solid fa-trash" data-id=${product.id}></i>
            </div>
            </div>

            `;
    cartContent.appendChild(div);
  }

  setUp() {
    //1- get cart from local storage
    cart = Storage.getCart() || []; //if storage.getcart wasn't a truthy, add [] only
    //2- show products in modal
    cart.forEach((cartItem) => {
      this.showItemInCart(cartItem);
    });
    //3- Set values (price and number of items)
    this.setCartValue(cart);
  }

  cartLogic() {
    //cleart cart
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });
    //manage quanti ty
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("fa-chevron-up")) {
        const addQuantity = e.target;
        //1- get item from cart and add to it
        const addedItem = cart.find(
          (cartItem) => cartItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        //2- update setvalue
        this.setCartValue(cart);
        //3- save cart
        Storage.saveCart(cart);
        //4- update UI
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (e.target.classList.contains("fa-trash")) {
        const removeItem = e.target;
        const _removedItem = cart.find(
          (cartItem) => cartItem.id == removeItem.dataset.id
        );
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.closest(".cart__item"));
      } else if (e.target.classList.contains("fa-chevron-down")) {
        const subQuantity = e.target;
        const subtractedItem = cart.find(
          (cartItem) => cartItem.id == subQuantity.dataset.id
        );
        if (subtractedItem.quantity === 1) {
          this.removeItem(subtractedItem.id);
          cartContent.removeChild(subQuantity.closest(".cart__item"));
        }
        subtractedItem.quantity--;
        subQuantity.previousElementSibling.innerText = subtractedItem.quantity;
        this.setCartValue(cart);
        Storage.saveCart(cart);
      }
    });
  }

  clearCart() {
    //remove method: DRY =>
    cart.forEach((cartItem) => {
      this.removeItem(cartItem.id);
    });
    //delete item from Dom
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }

  //todo => your cart is empty .... message

  removeItem(id) {
    // 1- Update the cart array
    cart = cart.filter((cartItem) => cartItem.id !== parseInt(id));

    // 2- Update cart values (price and number of items)
    this.setCartValue(cart);

    // 3- Update local storage
    Storage.saveCart(cart);

    // 4- Update "Add to cart" button text and state
    this.turnAddedBtn(id);
  }

  turnAddedBtn(id) {
    const btnToChange = buttonsDOM.find((btn) => btn.dataset.id == id);
    btnToChange.innerText = "Add to cart";
    btnToChange.disabled = false;
  }
}

//3- keep in storage even when refereshing
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((item) => item.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // to get products when refreshing
  const products = new Products();
  const productData = products.getProducts();
  // to show products when refreshing
  const ui = new UI();
  ui.displayProducts(productData);
  //get cart and set up application when relaoding :
  ui.setUp();
  ui.cartLogic();
  ui.getAddToCartBtns();
  //   save the products
  Storage.saveProducts(productData);
});

// For modal
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.pointerEvents = "auto";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.pointerEvents = "none";
}

cartBtn.addEventListener("click", showModalFunction);
backDrop.addEventListener("click", closeModalFunction);
closeModal.addEventListener("click", closeModalFunction);
