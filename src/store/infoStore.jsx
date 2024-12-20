import createStore from 'teaful';
import React from "react";

export const { useStore: useUserInfo } = createStore({
    user: "",
    phone: "",
    latitude: 0,
    longitude: 0,
});