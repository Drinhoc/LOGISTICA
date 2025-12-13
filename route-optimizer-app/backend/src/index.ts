import { app } from './app';
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`✅ Backend server running on port ${port}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
