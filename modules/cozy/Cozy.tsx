import {Box} from "@mui/material";
import Image from "next/image";
import {FC} from "react";

const COZY_IMAGE_URL = "https://cdn.berry.camp/file/berrycamp/static/welcome/images"
const COZY_IMAGE_COUNT = 7;

export const Cozy: FC = () => {
  return (
    <Box position="fixed" bottom={0} zIndex={-1} width="100%" height="100%">
      <Image
        unoptimized
        priority
        objectFit="cover"
        src={`${COZY_IMAGE_URL}/${Math.floor(Math.random() * COZY_IMAGE_COUNT) + 1}.png`}
        alt='A large comfy animation of Madeline near a campfire in-game'
        layout="fill"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </Box>
  );
}