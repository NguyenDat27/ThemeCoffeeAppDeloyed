import ListItem from "../../components/list-item";
import { useCheckUser } from "../../hooks/hooks";
import { useUserInfo } from "../../store/infoStore";
import React from "react";

const PersonPicker = () => {
  const [user] = useUserInfo.user();
  const [phone] = useUserInfo.phone();

  const checkAuth = useCheckUser(); 

  const handleAuthClick = async () => { 
    const login = await checkAuth(); 
    if (login) { 
      await login(); 
    } 
  };

  if (user === "" && phone === "") {
    return (
      <ListItem
        onClick={handleAuthClick}
        title="Chọn người nhận"
        subtitle="Yêu cầu truy cập số điện thoại"
      />
    );
  }

  return (
    <ListItem
      title={`${user} - ${phone}`}
      subtitle="Người nhận"
    />
  );
};

export default PersonPicker;
