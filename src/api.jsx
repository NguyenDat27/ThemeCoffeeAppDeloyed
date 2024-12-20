import { authorize, getPhoneNumber, getUserInfo, getAccessToken, getSetting, getLocation } from "zmp-sdk/apis";

export const authorizeUser = async (scopes = []) => {
    try {
      const data = await authorize({ scopes });
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

export const getAuth = async () => {
    try {
        const data = await getSetting({});
        console.log(data);
        return data.authSetting;
    } catch (error) {
        console.log(error);
    }
}

export const getUser = async () => {
  try {
    const { userInfo } = await getUserInfo({});
    console.log("Lấy thông tin thành công: ", userInfo);
    return userInfo.name;
  } catch (error) {
    console.log("Lấy thông tin thất bại");
  }
};

export const getPhoneFunction = async () => {
  try {
    // Get Access Token
    const accessToken = await getAccessToken({});
    console.log("Token access:", accessToken);

    return new Promise((resolve, reject) => {
      getPhoneNumber({
        success: async (dataPhone) => {
          let { token } = dataPhone;

          // Transfer Data
          const endpoint = import.meta.env.VITE_END_POINT_AUTH;
          const options = {
            method: "GET",
            headers: {
              access_token: accessToken,
              code: token,
              secret_key: import.meta.env.VITE_SECRET_KEY_APP,
            },
          };

          try {
            const response = await fetch(endpoint, options);
            const res = await response.json();

            if (response.ok && res.data?.number) {
              console.log("Response Code:", response.status);
              console.log("Response Body:", res.data.number);
              resolve(res.data.number);
            } else {
              reject(new Error("Không lấy được số điện thoại."));
            }
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Lỗi trong getPhoneFunction:", error);
    throw error;
  }
};


export const getLocationFunction = async () => {
  try {
    // Get Access Token
    const accessToken = await getAccessToken({});
    console.log("Token access:", accessToken);

    return new Promise((resolve, reject) => {
      getLocation({
        success: async (dataLocation) => {
          let { token } = dataLocation;

          // Transfer Data
          const endpoint = import.meta.env.VITE_END_POINT_AUTH;
          const options = {
            method: "GET",
            headers: {
              access_token: accessToken,
              code: token,
              secret_key: import.meta.env.VITE_SECRET_KEY_APP,
            },
          };

          try {
            const response = await fetch(endpoint, options);
            const res = await response.json();

            if (response.ok && res.data) {
              console.log("Response Code:", response.status);
              console.log("Response Body:", res.data);
              resolve(res.data);
            } else {
              reject(new Error("Không lấy được vị trí."));
            }
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Lỗi trong getLocationFunction:", error);
    throw error;
  }
};
