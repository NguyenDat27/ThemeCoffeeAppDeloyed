import { Suspense } from "react";
import { FinalPrice } from "../../components/display/final-price";
import { DisplayPrice } from "../../components/display/price";
import ProductPicker from "../../components/product/picker";
import Section from "../../components/section";
import { ProductSlideSkeleton } from "../../components/skeletons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box, Text } from "zmp-ui";
import { mergeData } from "../../hooks/hooks";
import { useProducts } from "../../store/productStore";
import React from "react";
import { useVariants } from "../../store/variantStore";
import { styled } from 'styled-components';

const RecommendContent = () => {

  const [products] = useProducts.products();
  const [options] = useVariants.variants();

  const productCommended = mergeData(products, options)
  
  const recommendProducts = productCommended
  .filter(product => product.sale)
  .map(product => ({
    ...product,
    variants: product.variants || [],
  }));

  return (
    <Section title="Gợi ý cho bạn" padding="title-only">
      <Swiper slidesPerView={1.25} spaceBetween={16} className="px-4">
        {recommendProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductPicker product={product}>
              {({ open }) => (
                <div onClick={open} className="space-y-3">
                  <Box
                    className="relative aspect-video rounded-lg bg-cover bg-center bg-skeleton"
                    style={{ backgroundImage: `url(${product.image})` }}
                  >
                    {product.sale && (
                      <Text
                        size="xxxxSmall"
                        className="absolute right-2 top-2 uppercase bg-green text-white h-4 px-[6px] rounded-full"
                      >
                        Giảm{" "}
                        {product.sale.type === "percent" ? (
                          `${product.sale.percent * 100}%`
                        ) : (
                          <DisplayPrice>{product.sale.amount}</DisplayPrice>
                        )}
                      </Text>
                    )}
                  </Box>
                  <Box className="space-y-1">
                    <Text size="small">{product.name}</Text>
                    <Text size="xxSmall" className="line-through text-gray">
                      <DisplayPrice>{product.price}</DisplayPrice>
                    </Text>
                    <Text size="large" className="font-medium text-primary">
                      <FinalPrice>{product}</FinalPrice>
                    </Text>
                  </Box>
                </div>
              )}
            </ProductPicker>
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
};

const RecommendFallback = () => {
  const recommendProducts = [...new Array(3)];

  return (
    <Section title="Gợi ý cho bạn" padding="title-only">
      <Swiper slidesPerView={1.25} spaceBetween={16} className="px-4">
        {recommendProducts.map((product, i) => (
          <SwiperSlide key={product + i}>
            <ProductSlideSkeleton />
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
};

const Recommend = () => {
  return (
    <Suspense fallback={<RecommendFallback />}>
      <RecommendContent />
    </Suspense>
  );
};

export default Recommend;
