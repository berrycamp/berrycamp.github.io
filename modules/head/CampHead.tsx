import Head from "next/head";
import {FC} from "react";
import {getMetadataTitle, getTitle} from "../common/title";

export const CampHead: FC<CampHeadProps> = ({title, description, image}) => {
  return (
    <Head>
      <title>{getTitle(title)}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={getMetadataTitle(title)} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </Head>
  );
}

interface CampHeadProps {
  title?: string;
  description: string;
  image: string;
}