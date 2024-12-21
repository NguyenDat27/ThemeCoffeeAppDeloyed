import { useEffect, useRef, useState } from "react";
import { matchStatusBarColor } from "../utils/device";
import { useNavigate, useSnackbar } from "zmp-ui";
import React from "react";
import { calcFinalPrice } from "../utils/product";
import { useCartItems } from "../store/cartStore";
import { authorizeUser, getAuth, getLocationFunction, getPhoneFunction, getUser } from '../api';
import { useUserInfo } from '../store/infoStore'
import { useStores } from "../store/listStore";
import { calculateDistance } from "../utils/location";
import { events, EventName } from "zmp-sdk";

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
      if (appTransID || eventType === "PAY_BY_BANK") {
        navigate("/result", {
          state: resp,
        });
      }
    });

    events.on(EventName.PaymentClose, (data = {}) => {
      console.log("data paymentclose", data);
      const { zmpOrderId } = data;
      navigate("/result", {
        state: { data: { zmpOrderId } },
      });
    });
  }, []);
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


export const useNearStore = (store, lat, long) => {

  const sortedStores = store
    .map((stores) => ({
      ...stores,
      distance: calculateDistance(
        lat,
        long,
        stores.lat,
        stores.long
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  return sortedStores;
};

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



export const useCheckUser = () => {
  const [user, setUser] = useUserInfo.user();
  const [phone, setPhone] = useUserInfo.phone();

  const checkAuth = async () => {
    let data = await getAuth();

    if (!data["scope.userInfo"] || !data["scope.userPhonenumber"]) {
      await authorizeUser(["scope.userInfo", "scope.userPhonenumber"]);
      data = await getAuth();
    }

    const login = async () => {

      if (data["scope.userInfo"]) {
        const info = await getUser();
        setUser(info);
      }

      if (data["scope.userPhonenumber"]) {
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

export const useCheckLocation = () => {
  const [latitude, setLatitude] = useUserInfo.latitude();
  const [longitude, setLongitude] = useUserInfo.longitude();
  const [selectedStore, setSelectedStore] = useStores.selectStore();
  const [stores] = useStores.stores();
  const [listNearStore, setListNearStore] = useStores.nearStores();
  

  const checkAuth = async () => {
    let data = await getAuth();

    if (!data["scope.userLocation"]) {
      await authorizeUser(["scope.userLocation"]);
      data = await getAuth();
    }

    const login = async () => {
      if (data["scope.userLocation"]) {
        try {
          const dataLocation = await getLocationFunction();
          console.log("Latitude in hooks:", dataLocation.latitude);
          console.log("Longitude in hooks:", dataLocation.longitude);

          setLatitude(dataLocation.latitude);
          setLongitude(dataLocation.longitude);

          await new Promise((resolve) => setTimeout(resolve, 50));

          const listnearStore = useNearStore(stores, dataLocation.latitude, dataLocation.longitude);
          setListNearStore(listnearStore);
          setSelectedStore(listnearStore[0]);

        } catch (error) {
          console.error("Không lấy được vị trí:", error);
        }
      }
    };
    return login;
  };


  return checkAuth;
};






