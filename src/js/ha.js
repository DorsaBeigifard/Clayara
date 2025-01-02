const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const productsList = document.querySelector(".products__list");

import { productsData } from "./products.js";

let cart = [];

// 1- Get products (either import or fetch from an API)
class Products {
  getProducts() {
    return productsData;
  }
}

// 2- Display products
class UI {
  displayProducts(products) {
    // Display new products first
    const sortedProducts = products.sort((a, b) => b.isNew - a.isNew);

    let result = "";
    sortedProducts.forEach((item) => {
      result += `
        <div class="product">
          <div class="product__image">
            <img src="${item.imageUrl}" alt="${item.title}" />
            <div class="tags">
              ${item.isNew ? `<p class="tags__new">New</p>` : ""}
            </div>
          </div>
          <div class="product__details">
            <h2>${item.title}</h2>
            <h3>${item.category}</h3>
            <div class="price-details d-flex between-lg middle-lg">
              <p class="price">$${item.price}</p>
              <button class="btn btn__outline add-btn" data-id="${item.id}">
                Add to cart
              </button>
            </div>
          </div>
        </div>`;
    });

    productsList.innerHTML = result;
  }

  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-btn")]; // Convert NodeList to array
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;

      // Check if the product is already in the cart
      const isInCart = cart.find((item) => item.addedProduct.id == id);
      if (isInCart) {
        btn.innerText = "Added";
        btn.disabled = true;
      }

      // Add product to the cart
      btn.addEventListener("click", (e) => {
        e.target.innerText = "Added";
        btn.disabled = true;

        // Get the product from local storage
        const addedProduct = Storage.getProduct(id);
        console.log("Added Product:", addedProduct);

        // Add to cart
        if (addedProduct) {
          cart.push({ addedProduct, quantity: 1 });
          console.log("Cart after adding product:", cart);

          // Save cart to local storage
          Storage.saveCart(cart);
        } else {
          console.error("Product not found!");
        }
      });
    });
  }
}

// 3- Handle local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    console.log("Products in Storage:", _products);
    return _products.find((item) => item.id == id); // Use loose equality to handle type mismatch
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize products and UI
  const products = new Products();
  const productData = products.getProducts();

  const ui = new UI();
  ui.displayProducts(productData);
  ui.getAddToCartBtns();

  // Save the products to local storage
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