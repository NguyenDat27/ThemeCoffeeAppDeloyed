import createStore from 'teaful';
import React from "react";

export const { useStore: useStores } = createStore({
    stores: [],
    nearStores: [],
    selectStore: [],
});
  