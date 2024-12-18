import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FinalPrice } from "../display/final-price";
import { Sheet } from "../../components/fullscreen-sheet";
import { Box, Button, Text } from "zmp-ui";
import MultipleOptionPicker from "./multiple-option-picker";
import QuantityPicker from "./quantity-picker";
import { isIdentical } from "../../utils/product";
import SingleOptionPicker from './single-option-picker';
import { useCartItems } from "../../store/cartStore";
import { produce } from "immer";


function getDefaultOptions(product) {
  if (product && product.variants) {
    return product.variants.reduce(
      (options, variant) =>
        Object.assign(options, {
          [variant.id]: variant.default,
        }),
      {}
    );
  }
  return {};
}

const ProductPicker = ({ children, product, selected }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState(selected ? selected.options : getDefaultOptions(product));
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useCartItems.cartItems();

  useEffect(() => {
    if (selected) {
      setOptions(selected.options);
      setQuantity(selected.quantity);
    }
  }, [selected]);

  const addToCart = () => {
    if (product) {
      setCart((cart) =>
        produce(cart, (draft) => {
          if (selected) {
            const editing = draft.find(
              (item) =>
                item.product.id === product.id &&
                isIdentical(item.options, selected.options)
            );
            if (quantity === 0) {
              const index = draft.indexOf(editing);
              if (index !== -1) draft.splice(index, 1);
            } else {
              const existed = draft.find(
                (item, i) =>
                  i !== draft.indexOf(editing) &&
                  item.product.id === product.id &&
                  isIdentical(item.options, options)
              );
              const index = draft.indexOf(editing);
              if (index !== -1) {
                const updatedItem = Object.assign({}, editing, {
                  options,
                  quantity: existed ? existed.quantity + quantity : quantity,
                });
                draft.splice(index, 1, updatedItem);
              }
              if (existed) {
                const existedIndex = draft.indexOf(existed);
                if (existedIndex !== -1) draft.splice(existedIndex, 1);
              }
            }
          } else {
            const existed = draft.find(
              (item) =>
                item.product.id === product.id &&
                isIdentical(item.options, options)
            );
            if (existed) {
              const existedIndex = draft.indexOf(existed);
              if (existedIndex !== -1) {
                const updatedItem = Object.assign({}, existed, {
                  quantity: existed.quantity + quantity,
                });
                draft.splice(existedIndex, 1, updatedItem);
              }
            } else {
              draft.push(Object.assign({}, { product, options, quantity }));
            }
          }
        })
      );
    }
    setVisible(false);
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false),
      })}
      {createPortal(
        <Sheet visible={visible} onClose={() => setVisible(false)} autoHeight>
          {product && (
            <Box className="space-y-6 mt-2" p={4}>
              <Box className="space-y-2">
                <Text.Title>{product.name}</Text.Title>
                <Text>
                  <FinalPrice options={options}>{product}</FinalPrice>
                </Text>
                <Text>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.description ?? "",
                    }}
                  ></div>
                </Text>
              </Box>
              <Box className="space-y-5">
                {product.variants &&
                  product.variants.map((variant) =>
                    variant.type === "single" ? (
                      <SingleOptionPicker
                        key={variant.id}
                        variant={variant}
                        value={options[variant.id]}
                        onChange={(selectedOption) =>
                          setOptions((prevOptions) =>
                            Object.assign({}, prevOptions, {
                              [variant.id]: selectedOption,
                            })
                          )
                        }
                      />
                    ) : (
                      <MultipleOptionPicker
                        key={variant.id}
                        product={product}
                        variant={variant}
                        value={options[variant.id]}
                        onChange={(selectedOption) =>
                          setOptions((prevOptions) =>
                            Object.assign({}, prevOptions, {
                              [variant.id]: selectedOption,
                            })
                          )
                        }
                      />
                    )
                  )}
                <QuantityPicker value={quantity} onChange={setQuantity} />
                {selected ? (
                  <Button
                    variant={quantity > 0 ? "primary" : "secondary"}
                    type={quantity > 0 ? "highlight" : "neutral"}
                    fullWidth
                    onClick={addToCart}
                  >
                    {quantity > 0
                      ? selected
                        ? "Cập nhật giỏ hàng"
                        : "Thêm vào giỏ hàng"
                      : "Xoá"}
                  </Button>
                ) : (
                  <Button
                    disabled={!quantity}
                    variant="primary"
                    type="highlight"
                    fullWidth
                    onClick={addToCart}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Sheet>,
        document.body
      )}
    </>
  );
};

export default ProductPicker;
