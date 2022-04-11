import {CssBaseline} from '@mui/material'
import Head from 'next/head'
import {GetStaticProps, NextPage} from 'next/types'
import {Fragment} from 'react'
import {Chapter, DataTree} from '../logic/data/dataTree'
import fetchJson from '../logic/fetch/fetchJson'
import Browse from '../modules/browse/Browse'
import styles from '../styles/Home.module.css'

/**
 * Static room information.
 */
export const DATA_URL = 'https://cdn.berrycamp.com/file/berrycamp/data';

/**
 * All valid level names.
 */
export const LEVEL_NAMES: string[] = [
  "prologue",
  "city",
  "site",
  "resort",
  "ridge",
  "temple",
  "reflection",
  "summit",
  "epilogue",
  "core",
  "farewell",
]

interface HomeProps {
  data: DataTree;
}

const Home: NextPage<HomeProps> = (props) => {
  return (
    <Fragment>
      <Head>
        <title>Berry Camp</title>
        <meta name="description" content="Browse rooms from the video game celeste" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline />
      <main className={styles.main}>
        <Browse data={props.data} />
      </main>
      <footer />
    </Fragment>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data: DataTree = {};
  for (const name of LEVEL_NAMES) {
    data[name] = await fetchJson<Chapter>(`${DATA_URL}/${name}.json`);
  }

  return {
    props: {
      data,
    },
  };
}

export default Home
