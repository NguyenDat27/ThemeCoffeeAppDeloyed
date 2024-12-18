import { Swiper} from "zmp-ui"
import { Box } from "zmp-ui";
import { useBanners } from "../../store/bannerStore";
import React from "react";

const Banner = () => {

  const [banner] = useBanners.banners()  

  return (
    <Box className="bg-white" pb={4}>
      <Swiper
        duration="5000"
        autoplay
        loop
        cssMode
      >
        {banner
          .map((banners, i) => (
            <Swiper.Slide key={banners + i} className="px-4">
              <Box
                className="w-full rounded-lg aspect-[2/1] bg-cover bg-center bg-skeleton"
                style={{ backgroundImage: `url(${banners})` }}
              />
            </Swiper.Slide>
          ))}
      </Swiper>
    </Box>
  );
};

export default Banner;
