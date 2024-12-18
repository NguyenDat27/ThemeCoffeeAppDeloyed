import { FinalPrice } from "../display/final-price";
import { Box, Text } from "zmp-ui";
import ProductPicker from "./picker";
import React from "react";

const ProductItem = ({ product }) => {
  return (
    <ProductPicker product={product}>
      {({ open }) => (
        <div className="space-y-2" onClick={open}>
          <Box className="w-full aspect-square relative">
            <img
              loading="lazy"
              src={product.image}
              className="absolute left-0 right-0 top-0 bottom-0 w-full h-full object-cover object-center rounded-lg bg-skeleton"
            />
          </Box>
          <Text>{product.name}</Text>
          <Text size="xxSmall" className="text-gray pb-2">
            <FinalPrice>{product}</FinalPrice>
          </Text>
        </div>
      )}
    </ProductPicker>
  );
};

export default ProductItem;
