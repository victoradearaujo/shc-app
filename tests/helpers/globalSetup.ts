import { execSync } from "child_process";
import path from "path";

export default async function setup() {
  const testDbPath = path.resolve(process.cwd(), "prisma/test.db");
  execSync(
    `npx prisma db push --force-reset --skip-generate`,
    {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: `file:${testDbPath}` },
    }
  );
}
