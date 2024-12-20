import { getConfig } from "./config";
import React from "react";
import { Payment } from 'zmp-sdk/apis';
import HMAC from 'crypto-js/hmac-sha256';


export function calcFinalPrice(product, options) {
  let finalPrice = product.price;
  if (product.sale) {
    if (product.sale.type === "fixed") {
      finalPrice = product.price - product.sale.amount;
    } else {
      finalPrice = product.price * (1 - product.sale.percent);
    }
  }

  if (options && product.variants) {
    const selectedOptions = [];
    for (const variantKey in options) {
      const variant = product.variants.find((v) => v.id === variantKey);
      if (variant) {
        const currentOption = options[variantKey];
        if (typeof currentOption === "string") {
          const selected = variant.options.find((o) => o.id === currentOption);
          if (selected) {
            selectedOptions.push(selected);
          }
        } else {
          const selecteds = variant.options.filter((o) =>
            currentOption.includes(o.id)
          );
          selectedOptions.push(...selecteds);
        }
      }
    }
    finalPrice = selectedOptions.reduce((price, option) => {
      if (option.priceChange) {
        if (option.priceChange.type === "fixed") {
          return price + option.priceChange.amount;
        } else {
          return price + product.price * option.priceChange.percent;
        }
      }
      return price;
    }, finalPrice);
  }
  return finalPrice;
}

export function isIdentical(option1, option2) {
  const option1Keys = Object.keys(option1);
  const option2Keys = Object.keys(option2);

  if (option1Keys.length !== option2Keys.length) {
    return false;
  }

  for (const key of option1Keys) {
    const option1Value = option1[key];
    const option2Value = option2[key];

    const areEqual =
      Array.isArray(option1Value) &&
      Array.isArray(option2Value) &&
      [...option1Value].sort().toString() ===
        [...option2Value].sort().toString();

    if (option1Value !== option2Value && !areEqual) {
      return false;
    }
  }

  return true;
}

// Hàm tạo mã hóa HMAC
const createHmac = (params, privateKey) => {
  const dataMac = Object.keys(params)
    .sort() // sắp xếp key của Object data theo thứ tự từ điển tăng dần
    .map(
      (key) =>
        `${key}=${
          typeof params[key] === "object"
            ? JSON.stringify(params[key])
            : params[key]
        }`,
    ) // trả về mảng dữ liệu dạng [{key=value}, ...]
    .join("&"); // chuyển về dạng string kèm theo "&", ví dụ: amount={amount}&desc={desc}&extradata={extradata}&item={item}&method={method}`
  
  return HMAC(dataMac, privateKey).toString();
};

// Hàm tạo đơn hàng với tham số amount
export const createOrder = async (amount) => {
  // Dữ liệu muốn truyền vào API createOrder
  const params = {
    desc: `Thanh toán ${getConfig((config) => config.app.title)}`,
    item: [],
    amount: amount,
  };

  // Khóa bí mật để tạo HMAC
  const privateKey = "cc1ae951e08d9f1c7ccce3f80ed68ae8";

  // Tạo mã hóa HMAC
  const mac = createHmac(params, privateKey);

  try {
    await Payment.createOrder({
      ...params,
      mac: mac,
      success: (data) => { 
        console.log("Order successful. Data received:", data); 
      }, 
      fail: (err) => { 
        console.log("Order failed. Error:", err); 
      }
    });
  } catch (err){
    // Tạo đơn hàng lỗi
    console.log(err);
  }
};