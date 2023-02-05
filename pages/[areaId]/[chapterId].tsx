import {Container, Typography} from "@mui/material";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {createElement, Fragment} from "react";
import {Breadcrumbs} from "~/modules/breadcrumbs";
import {ChapterGridView} from "~/modules/chapter/ChapterGridView";
import {ChapterListView, ChapterViewProps} from "~/modules/chapter/ChapterListView";
import {ChapterHeaderImage} from "~/modules/chapter/HeaderImage";
import {HeaderNav} from "~/modules/chapter/HeaderNav";
import {AreaData, ChapterData, ChapterNav} from "~/modules/chapter/types";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getChapterImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {useCampContext} from "~/modules/provide/CampContext";
import {Area, Chapter} from "../../modules/data/dataTypes";

const ChapterPage: CampPage<ChapterProps> = ({area, chapter, sides, prevChapter, nextChapter}) => {
  const {settings: {listMode}} = useCampContext();

  return (
    <Fragment>
      <CampHead
        title={chapter.name}
        description={chapter.desc}
        image={getChapterImageUrl(area.id, chapter.id)}
      />
      <Container>
        <Breadcrumbs
          crumbs={[
            {name: area.name, href: `/${area.id}`},
            {name: chapter.name},
          ]}
        />
        <HeaderNav
          {...prevChapter && {
            prev: {
              label: prevChapter.name,
              link: `/${area.id}/${prevChapter.id}`
            }
          }}
          {...nextChapter && {
            next: {
              label: nextChapter.name,
              link: `/${area.id}/${nextChapter.id}`
            }
          }}
        />
        <ChapterHeaderImage area={area} chapter={chapter} />
        <Typography variant="h5" color="text.secondary" pt={2} pb={1}>Sides</Typography>
        {createElement(listMode ? ChapterListView : ChapterGridView, {sides})}
      </Container>
    </Fragment>
  );
}

interface ChapterParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  const paths: {params: ChapterParams; locale?: string}[] = [];

  for (const areaId of VALID_AREAS) {
    const area: Area = await fetchArea(areaId);
    for (const {id} of area.chapters) {
      paths.push({params: {areaId, chapterId: id}});
    }
  }

  return {
    paths,
    fallback: false,
  }
}

interface ChapterProps {
  area: AreaData;
  chapter: ChapterData;
  sides: ChapterViewProps["sides"];
  prevChapter?: ChapterNav;
  nextChapter?: ChapterNav;
};

export const getStaticProps: GetStaticProps<ChapterProps, ChapterParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId} = params;

  const area: Area =  await fetchArea(areaId);

  const chapterIndex: number = area.chapters.findIndex(chapter => chapter.id === chapterId);
  const chapter: Chapter | undefined = area.chapters[chapterIndex];
  if (chapter === undefined) {
    throw Error(`Chapter not found for ${chapterId}`);
  }

  const prevChapter: Chapter | undefined = area.chapters[chapterIndex - 1];
  const nextChapter: Chapter | undefined = area.chapters[chapterIndex + 1];

  return {
    props: {
      area: {
        id: area.id,
        name: area.name,
        desc: area.desc,
      },
      chapter: {
        id: chapter.id,
        gameId: chapter.gameId,
        name: chapter.name,
        desc: chapter.desc,
        ...(chapter.chapterNo && {no: chapter?.chapterNo}),
      },
      sides: chapter.sides.map(({name, id, checkpoints, rooms}) => ({
        name,
        href: `/${area.id}/${chapter.id}/${id}`,
        roomCount: checkpoints.reduce((a, b) => a + b.roomCount, 0),
        src: getChapterImageUrl(area.id, chapter.id),
      })),
      ...(prevChapter && {prevChapter}),
      ...(nextChapter && {nextChapter}),
    }
  };
}

export default ChapterPage;
