import { Box, Header, Icon, Page, Text, Modal } from "zmp-ui";
import subscriptionDecor from "../static/subscription-decor.svg";
import ListRenderer from "../components/list-renderer";
import { useCheckUser } from "../hooks/hooks";
import styled from "styled-components";
import React, { useState } from "react";
import SimpleMap from "../components/map";

const SubscriptionBox = styled(Box)`
  background-image: url(${subscriptionDecor});
  background-position: right 8px center;
  background-repeat: no-repeat;
`;

const ProfilePage = () => {
  return (
    <Page>
      <Header showBackIcon={false} title="&nbsp;" />
      <Subscription />
      <Personal />
      <Other />
      <TestMap />
    </Page>
  );
};

const Subscription = () => {

  const checkAuth = useCheckUser(); 

  const handleAuthClick = async () => { 
    const login = await checkAuth(); 
    if (login) { 
      await login(); 
    } 
  };

  return (
    <Box className="m-4" onClick={handleAuthClick}>
      <SubscriptionBox
        className="bg-green text-white rounded-xl p-4 space-y-2"
      >
        <Text.Title className="font-bold">Đăng ký thành viên</Text.Title>
        <Text size="xxSmall">Tích điểm đổi thưởng, mở rộng tiện ích</Text>
      </SubscriptionBox>
    </Box>
  );
};

const Personal = () => {

  const checkAuth = useCheckUser(); 

  const handleAuthClick = async () => { 
    const login = await checkAuth(); 
    if (login) { 
      await login(); 
    } 
  };

  return (
    <Box className="m-4">
      <ListRenderer
        title="Cá nhân"
        onClick={handleAuthClick}
        items={[
          {
            left: <Icon icon="zi-user" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Thông tin tài khoản
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
          },
          {
            left: <Icon icon="zi-clock-2" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Lịch sử đơn hàng
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
          },
        ]}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
      />
    </Box>
  );
};

const Other = () => {

  const checkAuth = useCheckUser(); 

  const handleAuthClick = async () => { 
    const login = await checkAuth(); 
    if (login) { 
      await login(); 
    } 
  };

  return (
    <Box className="m-4">
      <ListRenderer
        title="Khác"
        onClick={handleAuthClick}
        items={[
          {
            left: <Icon icon="zi-star" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Đánh giá đơn hàng
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
          },
          {
            left: <Icon icon="zi-call" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Liên hệ và góp ý
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
          },
        ]}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
      />
    </Box>
  );
};

const TestMap = () => {
  const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị modal

  const handleOpenModal = () => {
    setShowModal(true); // Mở modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Đóng modal
  };

  return (
    <Box className="m-4">
      <ListRenderer
        title="Map"
        onClick={handleOpenModal} // Gọi hàm mở modal
        items={[
          {
            left: <Icon icon="zi-star" />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Test Map
                </Text.Header>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
          },
        ]}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
      />

      {/* Modal hiển thị bản đồ */}
      {showModal && (
        <Modal
          visible={showModal}
          onClose={handleCloseModal} // Đóng modal khi nhấn nút close
          // title="Map Viewer"
          // className="modal-map"
        >
          <Box>
            <SimpleMap /> {/* Render bản đồ trong modal */}
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default ProfilePage;
