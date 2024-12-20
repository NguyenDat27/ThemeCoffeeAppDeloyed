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
import { Payment, events, EventName } from "zmp-sdk/apis";

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
      const path = data?.path;
      if (path.includes(RedirectPath)) {
        Payment.checkTransaction({
          data: path,
          success: (rs) => {
            const { orderId, resultCode, msg, transTime, createdAt } = rs;
            navigate("/result");
            console.log("data open:", orderId, resultCode, msg, transTime, createdAt)
          },
          fail: (err) => {
            navigate("/result");
            console.log("open", err);
          },
        });s
      }
    });

    events.on(EventName.OnDataCallback, (resp) => {
      const { eventType, data } = resp;
      if (eventType === "PAY_BY_BANK") {
        if (data.appTransID) {
          // gọi api checkTransaction để lấy thông tin giao dịch
          Payment.checkTransaction({
            data,
            success: (rs) => {
              // Kết quả giao dịch khi gọi api thành công
              const { id, resultCode, msg, transTime, createdAt } = rs;
              navigate("/result");
              console.log("data ondataCallback bank:", orderId, resultCode, msg, transTime, createdAt)
            },
            fail: (err) => {
              // Kết quả giao dịch khi gọi api thất bại
              navigate("/result");
              console.log("ondataCallback bank", err);
            },
          });
        }
      }
      if (eventType === "PAY_BY_CUSTOM_METHOD") {
        // method: mã phương thức thanh toán
        // orderId: mã của đơn hàng thanh toán
        const { method, orderId } = data;
        navigate("/result");
        console.log("data ondataCallback custom:", method, orderId)
      }
    });

    events.on(EventName.PaymentClose, (data) => {
      const resultCode = data?.resultCode;

      // kiểm tra resultCode trả về từ sự kiện PaymentClose
      // 0: Đang xử lý
      // 1: Thành công
      // -1: Thất bại
    
      //Nếu trạng thái đang thực hiện, kiểm tra giao dịch bằng API checkTransaction nếu muốn
      if (resultCode === 0) {
        Payment.checkTransaction({
          data: { zmpOrderId: data?.zmpOrderId },
          success: (rs) => {
            // Kết quả giao dịch khi gọi api thành công
            const { orderId, resultCode, msg, transTime, createdAt } = rs;
            navigate("/result");
            console.log("data close 0:", orderId, resultCode, msg, transTime, createdAt)
          },
          fail: (err) => {
            // Kết quả giao dịch khi gọi api thất bại
            navigate("/result");
            console.log("close 0:", err);
          },
        });
      } else {
        // Xử lý kết quả thanh toán thành công hoặc thất bại 
        const { orderId, resultCode, msg, transTime, createdAt } = data;
        navigate("/result");
        console.log("data close -1,1:", orderId, resultCode, msg, transTime, createdAt)
      }
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






