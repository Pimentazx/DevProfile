const { URL } = require('node:url');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL precisa estar definida para os testes e2e.');
}

const databaseName = decodeURIComponent(new URL(connectionString).pathname.slice(1));

if (databaseName !== 'devprofile_test') {
  throw new Error(
    `Os testes e2e só podem usar o banco devprofile_test (recebido: ${databaseName}).`,
  );
}
