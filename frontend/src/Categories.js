import { Container, Typography } from '@mui/material';
import React from 'react';
import { fetchCategories } from './query.svc';

function Categories() {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    fetchCategories().then(data => {
      if (data && data.categories) {
        setCategories(data.categories);
        console.log("Fetched categories:", data.categories);
      } else {
        console.error("Failed to fetch categories or no categories found");
      }
    }).catch(error => {
      console.error("Error fetching categories:", error);
    });
  }, []);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // height: '100%',
        height: "calc(100vh - 120px)",
      }}
    >
      <Typography variant="h5"
        sx={{ flex: '0 0 auto' }}
      >
        Categories
      </Typography>
    </Container>
  );
}
export default Categories;
