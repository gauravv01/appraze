import * as fs from 'fs';
import * as path from 'path';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  process.exit(1);
}

const timestamp = new Date().getTime();
const fileName = `${timestamp}_${migrationName}.sql`;
const filePath = path.join(__dirname, 'versions', fileName);

const template = `-- Migration: ${migrationName}
-- Created at: ${new Date().toISOString()}

-- Write your SQL here

`;

fs.writeFileSync(filePath, template);
console.log(`Created migration: ${fileName}`); 