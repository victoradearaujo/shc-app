import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const testDbPath = path.resolve(__dirname, "../../prisma/test.db");
const schemaPath = path.resolve(__dirname, "../../prisma/schema.prisma");
const originalSchema = fs.readFileSync(schemaPath, "utf8");
const testSchema = originalSchema.replace(/url\s*=\s*"file:\.\/dev\.db"/, `url = "file:${testDbPath}"`);
const tmpSchemaPath = path.resolve(__dirname, "../../prisma/test-schema.prisma");

fs.writeFileSync(tmpSchemaPath, testSchema);

try {
  execSync(`npx prisma db push --schema="${tmpSchemaPath}" --force-reset --skip-generate`, {
    stdio: "inherit",
  });
} finally {
  fs.unlinkSync(tmpSchemaPath);
}
