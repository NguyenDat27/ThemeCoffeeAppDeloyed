import { useEffect, useRef, useState } from "react";
import { matchStatusBarColor } from "../utils/device";
import { EventName, events } from "zmp-sdk";
import { useNavigate, useSnackbar } from "zmp-ui";
import React from "react";
import { calcFinalPrice } from "../utils/product";
import { useCartItems } from "../store/cartStore";
import { authorizeUser, getAuth, getPhoneFunction, getUser } from '../api';
import { useUserInfo } from '../store/infoStore'

// Hook for matching status bar text color visibility
export function useMatchStatusTextColor(visible) {
  const changedRef = useRef(false);
  useEffect(() => {
    if (changedRef.current) {
      matchStatusBarColor(visible ?? false);
    } else {
      changedRef.current = true;
    }
  }, [visible]);
}

const originalScreenHeight = window.innerHeight;

// Hook for detecting if the virtual keyboard is visible
export function useVirtualKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const detectKeyboardOpen = () => {
      setVisible(window.innerHeight + 160 < originalScreenHeight);
    };
    window.addEventListener("resize", detectKeyboardOpen);
    return () => {
      window.removeEventListener("resize", detectKeyboardOpen);
    };
  }, []);

  return visible;
}

// Hook for handling payment events
export const useHandlePayment = () => {
  const navigate = useNavigate();
  useEffect(() => {
    events.on(EventName.OpenApp, (data) => {
      if (data?.path) {
        navigate(data?.path, {
          state: data,
        });
      }
    });

    events.on(EventName.OnDataCallback, (resp) => {
      const { appTransID, eventType } = resp;
      if (appTransID || eventType === "PAY_BY_CUSTOM_METHOD") {
        navigate("/result", {
          state: resp,
        });
      }
    });

    events.on(EventName.PaymentClose, (data = {}) => {
      const { zmpOrderId } = data;
      navigate("/result", {
        state: { data: { zmpOrderId } },
      });
    });
  }, [navigate]);
};

// Function for showing a snackbar message for "To Be Implemented"
export function useToBeImplemented() {
  const snackbar = useSnackbar();
  return () =>
    snackbar.openSnackbar({
      type: "success",
      text: "Chức năng dành cho các bên tích hợp phát triển...",
    });
}


export const mergeData = (products, variants) => {
  return products.map(product => {
    const mergedVariants = product.variantId.map(variantId => {
      const variantDetail = variants.find(v => v.id === variantId);
      if (variantDetail) {
        return {
          id: variantDetail.id,
          type: variantDetail.type,
          label: variantDetail.label,
          default: variantDetail.default,
          options: variantDetail.options.map(option => ({
            id: option.id,
            label: option.label,
            priceChange: option.priceChange
          }))
        };
      }
      return null;
    }).filter(Boolean);

    return {
      id: product.id,
      name: product.name,
      image: product.image,
      description: product.description,
      price: product.price,
      categoryId: product.categoryID,
      sale: product.sale,
      variants: mergedVariants
    };
  });
};


export function useFilteredProducts(keyword, products) {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (!keyword.trim()) {
      setFilteredProducts([]);
      return;
    }
    
    const timer = setTimeout(() => {
      const result = products.filter((product) =>
        product.name.trim().toLowerCase().includes(keyword.trim().toLowerCase())
      );
      setFilteredProducts(result);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, products]);

  return filteredProducts;
}

export function calTotalPrice () {
  const cart = useCartItems.cartItems();
      return cart.reduce(
        (total, item) =>
          total + item.quantity * calcFinalPrice(item.product, item.options),
        0
      );
}

export function calTotalItems () {
    const cart = useCartItems.cartItems();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

export function sortByDistance(locations) {
  return locations.sort((a, b) => a.distance - b.distance);
}

function convertPhoneNumber(phoneNumber) {
  if (phoneNumber.startsWith("84")) {
    return "0" + phoneNumber.slice(2);
  }
  return phoneNumber;
}

export const useCheckAuth = () => {
  const [user, setUser] = useUserInfo.user();
  const [phone, setPhone] = useUserInfo.phone();

  const checkAuth = async () => {
    const data = await getAuth();

    if (!data["scope.userLocation"] || !data["scope.userPhonenumber"]) {
      await authorizeUser(["scope.userLocation", "scope.userPhonenumber"]);
    }

    const login = async () => {

      if (data["scope.userLocation"] || data["scope.userPhonenumber"]) {
        const info = await getUser();
        setUser(info);


        try {
          const phoneNumber = await getPhoneFunction();
          setPhone(convertPhoneNumber(phoneNumber));
        } catch (error) {
          console.error("Không lấy được số điện thoại:", error);
        }
      };
    }
    return login;
  };

  return checkAuth;
};





