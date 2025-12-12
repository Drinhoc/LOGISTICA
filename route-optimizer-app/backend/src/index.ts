import { app } from './app';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
