import {Box, Typography} from "@mui/material";
import {Layout} from "modules/layout/Layout";
import {NextPage} from "next";
import Image from "next/image";
import {GlobalAppProps} from "./_app";

const IMAGE_URL = "https://cdn.berry.camp/file/berrycamp/screens/farewell/1/1/2.png";

export const Custom404: NextPage<GlobalAppProps> = ({mode, toggleMode, view, setView}) => {
  return (
    <Layout
      description={"Page could not be found"}
      imgUrl={IMAGE_URL}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" flex={1}>
        <Image
          className="pixelated-image"
          unoptimized
          src={IMAGE_URL}
          width={640}
          height={360}
          alt="Granny cannot be found"
        />
        <Typography component="div" fontSize="large" marginTop={1}><strong>404</strong> - Page could not be found</Typography>
      </Box>
    </Layout>
  );
}

export default Custom404;