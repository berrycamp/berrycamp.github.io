import {Box, Card, CardActionArea, CardContent, CardMedia, Grid, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import {NextPage} from "next/types";
import {DataTree} from "../../logic/data/dataTree";

const CHAPTER_IMG_BASE_URL = 'https://cdn.berrycamp.com/file/berrycamp/static/navigation/chapters/images/'

interface BrowseProps {
  data: DataTree;
}

const Browse: NextPage<BrowseProps> = props => {
  return (
    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", padding: 2}}>
      <ToggleButtonGroup sx={{marginBottom: 2}}>
        <ToggleButton value="card">Card View</ToggleButton>
        <ToggleButton value="list">List View</ToggleButton>
      </ToggleButtonGroup>
      <Grid container spacing={2} justifyContent="center">
        {Object.entries(props.data).map(([id, chapter]) => (
          <Grid item key={id} sx={{width: 465}}>
            <Card sx={{height: "100%"}}>
              <CardActionArea
                sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
                href={`/chapter/${id}`}
              >
                <CardMedia
                  component="img"
                  image={`${CHAPTER_IMG_BASE_URL}${id}.png`}
                />
                <CardContent sx={{flex: "1"}}>
                  <Typography variant="h6">
                    {chapter.chapter_no && `Chapter ${chapter.chapter_no} - `}
                    {chapter.name}
                  </Typography>
                  <Typography variant="body2">{chapter.desc}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Browse;