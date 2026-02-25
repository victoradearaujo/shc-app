import { execSync } from "child_process";

execSync("DATABASE_URL=file:./prisma/test.db npx prisma db push --force-reset", {
  stdio: "inherit",
});
