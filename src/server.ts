import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
// For Vercel serverless
export default app;

// For local development
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }