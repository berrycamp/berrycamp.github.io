import {Box, Typography} from "@mui/material";
import {getScreenURL} from "logic/fetch/image";
import {Layout} from "modules/layout/Layout";
import {NextPage} from "next";
import Image from "next/image";
import {GlobalCampProps} from "./_app";

const IMAGE = "farewell/1/1/2";

export const Custom404: NextPage<GlobalCampProps> = ({}) => {
  return (
    <Layout
      description={"Page could not be found"}
      image={IMAGE}
    >
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" flex={1}>
        <Image
          className="pixelated-image"
          unoptimized
          src={getScreenURL(IMAGE)}
          width={640}
          height={360}
          alt="Madeline standing in front of a grave"
        />
        <Typography component="div" fontSize="large" marginTop={1}><strong>404</strong> - Page could not be found</Typography>
      </Box>
    </Layout>
  );
}

export default Custom404;