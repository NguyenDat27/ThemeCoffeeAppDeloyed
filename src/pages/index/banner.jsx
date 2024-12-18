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
        {[1, 2, 3, 4, 5]
          .map((i) => banner[i-1])
          .map((banner, i) => (
            <Swiper.Slide key={banner + i} className="px-4">
              <Box
                className="w-full rounded-lg aspect-[2/1] bg-cover bg-center bg-skeleton"
                style={{ backgroundImage: `url(${banner})` }}
              />
            </Swiper.Slide>
          ))}
      </Swiper>
    </Box>
  );
};

export default Banner;
