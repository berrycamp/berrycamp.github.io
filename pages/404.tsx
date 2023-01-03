import {Box, Typography} from "@mui/material";
import {NextPage} from "next";
import Image from "next/image";
import {Fragment} from "react";
import {CampHead} from "~/modules/head/CampHead";
import {GlobalCampProps} from "./_app";

const image = `${process.env.NEXT_PUBLIC_BASE_URL}/img/404.png`;

export const Custom404: NextPage<GlobalCampProps> = () => (
  <Fragment>
    <CampHead
      description={"Page could not be found"}
      image={image}
    />
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" flex={1}>
      <Image
        unoptimized
        src={image}
        width={640}
        height={360}
        alt="Madeline standing in front of a grave"
        style={{
          imageRendering: "pixelated",
        }}
      />
      <Typography component="div" fontSize="large" marginTop={1}><strong>404</strong> - Page could not be found</Typography>
    </Box>
  </Fragment>
);

export default Custom404;