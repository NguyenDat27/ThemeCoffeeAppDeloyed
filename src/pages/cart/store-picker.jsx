import { useState } from "react";
import { createPortal } from "react-dom";
import { ActionSheet } from "../../components/fullscreen-sheet";
import ListItem from "../../components/list-item";
import { displayDistance } from "../../utils/location";
import { useStores } from "../../store/listStore";
import React from "react";
import { useCheckLocation, useNearStore } from "../../hooks/hooks";
import { useUserInfo } from "../../store/infoStore";

const StorePicker = () => {
  const [visible, setVisible] = useState(false);
  const checkLocation = useCheckLocation();
  const [selectedStore, setSelectedStore] = useStores.selectStore();
  const [listNearStore] = useStores.nearStores();


  const handleLocaltionClick = async () => {
    const login = await checkLocation();
    if (login) {
      await login();
    }

  };

  if (selectedStore.length === 0) {
    return (
      <ListItem
        onClick={handleLocaltionClick}
        title="Chọn cửa hàng"
        subtitle="Yêu cầu truy cập vị trí"
      />
    );
  }

  return (
    <>
      <ListItem
        onClick={() => setVisible(true)}
        title={selectedStore.name}
        subtitle={selectedStore.address}
      />

      {visible &&
        createPortal(
          <ActionSheet
            title="Các cửa hàng ở gần bạn"
            visible={visible}
            onClose={() => setVisible(false)}
            actions={[
              ...listNearStore.map((store) => ({
                text: store.distance
                  ? `${store.name} - ${displayDistance(store.distance)}`
                  : store.name,
                highLight: store.id === selectedStore.id,
                onClick: () => {
                  setSelectedStore(store);
                  setVisible(false);
                },
              })),
              [{ text: "Đóng", close: true, danger: true }],
            ]}
          />,
          document.body
        )}
    </>
  );
};

export default StorePicker;
