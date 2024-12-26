import { useState, useEffect } from "react";
import { Box, Button, Header, Page, Text, useNavigate } from "zmp-ui";
import { Payment } from "zmp-sdk";
import { useLocation } from "react-router";
import {
  IconPaymentFail,
  IconPaymentLoading,
  IconPaymentSuccess,
} from "../components/payment-icon";
import { useCartItems } from "../store/cartStore";
import React from "react";
import axios from "axios";

const CheckoutResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [paymentResult, setPaymentResult] = useState();
  const [resultCode, setResultCode] = useState();
  const [cart, setCart] = useCartItems.cartItems();

  useEffect(() => {

    const check = () => {
      let data = state;
      if (data) {
        if ("path" in data) {
          data = data.path;
        } else if ("data" in data) {
          data = data.data;
        }
      } else {
        data = window.location.search.slice(1);
      }
      Payment.checkTransaction({
        data,
        success: (rs) => {
          // Kết quả giao dịch khi gọi api thành công
          console.log("Transaction Success:", rs);
          setPaymentResult(rs);
        },
        fail: (err) => {
          // Kết quả giao dịch khi gọi api thất bại
          console.log("Transaction Fail:", rs);
          setPaymentResult(err);
        },
      });
    };

    check();

    console.log("Final status", paymentResult);

  }, []);

  useEffect(() => {
    if (paymentResult?.resultCode > 0) {
      setCart([]);
    }
  }, [paymentResult])

  const renderResult = ({ title, message, icon }) => (
    <Box className="p-6 space-y-3 flex-1 flex flex-col justify-center items-center text-center">
      <div className="p-4">{icon}</div>
      {title && (
        <Text size="xLarge" className="font-medium">
          {title}
        </Text>
      )}
      <Text className="text-[#6F7071]">{message}</Text>
    </Box>
  );

  return (
    <Page className="flex flex-col bg-white">
      <Header title="Kết quả thanh toán" />
      {(function () {
        if (paymentResult) {
          if (paymentResult.method === "COD_SANDBOX") {
            return renderResult({
              title: "Đơn hàng đã xác nhận",
              message: `Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.`,
              icon: <IconPaymentSuccess />,
            });
          } else {
            if (paymentResult.resultCode === 1) {
              return renderResult({
                title: "Thanh toán thành công",
                message: `Đơn hàng đã được thanh toán thành công. Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.`,
                icon: <IconPaymentSuccess />,
              });
            } else {
              return renderResult({
                title: "Thanh toán thất bại",
                message: `Có lỗi trong quá trình xử lý. Vui lòng kiểm tra lại hoặc liên hệ Shop để được hỗ trợ.`,
                icon: <IconPaymentFail />,
              });
            }
          }
        }
        return renderResult({
          message: `Hệ thống đang xử lý thanh toán, vui lòng chờ trong ít phút...`,
          icon: <IconPaymentLoading />,
        });
      })()}
      {paymentResult && (
        <div className="p-4">
          <Button fullWidth onClick={() => navigate("/", { replace: true })}>
            {paymentResult.resultCode === 1 ? "Hoàn tất" : "Đóng"}
          </Button>
        </div>
      )}
    </Page>
  );
};

export default CheckoutResultPage;

