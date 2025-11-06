# Dependencies and Licenses

This document lists all third-party dependencies used in CampusBot, including their licenses, web addresses, and whether they are mandatory or optional.

## Production Dependencies

| Package | Version | License | Web Address | Status | Purpose |
|---------|---------|---------|-------------|--------|---------|
| bcrypt | ^6.0.0 | MIT | https://www.npmjs.com/package/bcrypt | Mandatory | Password hashing |
| cors | ^2.8.5 | MIT | https://www.npmjs.com/package/cors | Mandatory | Cross-Origin Resource Sharing |
| dotenv | ^16.4.5 | BSD-2-Clause | https://www.npmjs.com/package/dotenv | Mandatory | Environment variable management |
| express | ^4.19.2 | MIT | https://www.npmjs.com/package/express | Mandatory | Web framework |
| helmet | ^7.1.0 | MIT | https://www.npmjs.com/package/helmet | Mandatory | Security headers |
| joi | ^17.13.3 | BSD-3-Clause | https://www.npmjs.com/package/joi | Mandatory | Data validation |
| jsonwebtoken | ^9.0.2 | MIT | https://www.npmjs.com/package/jsonwebtoken | Mandatory | JWT authentication |
| morgan | ^1.10.0 | MIT | https://www.npmjs.com/package/morgan | Mandatory | HTTP request logger |
| pg | ^8.13.0 | MIT | https://www.npmjs.com/package/pg | Optional* | PostgreSQL client |
| swagger-ui-express | ^5.0.0 | MIT | https://www.npmjs.com/package/swagger-ui-express | Mandatory | API documentation UI |
| uuid | ^9.0.1 | MIT | https://www.npmjs.com/package/uuid | Mandatory | UUID generation |
| yaml | ^2.5.0 | ISC | https://www.npmjs.com/package/yaml | Mandatory | YAML parsing for OpenAPI |

\* PostgreSQL (`pg`) is optional - the application can run in in-memory mode without it.

## Development Dependencies

| Package | Version | License | Web Address | Status | Purpose |
|---------|---------|---------|-------------|--------|---------|
| @types/bcrypt | ^6.0.0 | MIT | https://www.npmjs.com/package/@types/bcrypt | Mandatory | TypeScript types for bcrypt |
| @types/cors | ^2.8.19 | MIT | https://www.npmjs.com/package/@types/cors | Mandatory | TypeScript types for cors |
| @types/express | ^4.17.21 | MIT | https://www.npmjs.com/package/@types/express | Mandatory | TypeScript types for express |
| @types/jest | ^29.5.12 | MIT | https://www.npmjs.com/package/@types/jest | Mandatory | TypeScript types for jest |
| @types/jsonwebtoken | ^9.0.10 | MIT | https://www.npmjs.com/package/@types/jsonwebtoken | Mandatory | TypeScript types for jsonwebtoken |
| @types/morgan | ^1.9.9 | MIT | https://www.npmjs.com/package/@types/morgan | Mandatory | TypeScript types for morgan |
| @types/node | ^20.11.30 | MIT | https://www.npmjs.com/package/@types/node | Mandatory | TypeScript types for Node.js |
| @types/pg | ^8.15.5 | MIT | https://www.npmjs.com/package/@types/pg | Mandatory | TypeScript types for pg |
| @types/supertest | ^2.0.12 | MIT | https://www.npmjs.com/package/@types/supertest | Mandatory | TypeScript types for supertest |
| @types/swagger-ui-express | ^4.1.8 | MIT | https://www.npmjs.com/package/@types/swagger-ui-express | Mandatory | TypeScript types for swagger-ui-express |
| @types/uuid | ^9.0.7 | MIT | https://www.npmjs.com/package/@types/uuid | Mandatory | TypeScript types for uuid |
| @typescript-eslint/eslint-plugin | ^8.46.3 | MIT | https://www.npmjs.com/package/@typescript-eslint/eslint-plugin | Mandatory | ESLint plugin for TypeScript |
| @typescript-eslint/parser | ^8.46.3 | MIT | https://www.npmjs.com/package/@typescript-eslint/parser | Mandatory | ESLint parser for TypeScript |
| eslint | ^9.39.1 | MIT | https://www.npmjs.com/package/eslint | Mandatory | JavaScript/TypeScript linter |
| eslint-config-prettier | ^9.1.0 | MIT | https://www.npmjs.com/package/eslint-config-prettier | Mandatory | ESLint config for Prettier |
| eslint-plugin-import | ^2.29.1 | MIT | https://www.npmjs.com/package/eslint-plugin-import | Mandatory | ESLint plugin for import statements |
| globals | ^16.5.0 | MIT | https://www.npmjs.com/package/globals | Mandatory | Global variables for ESLint |
| jest | ^29.7.0 | MIT | https://www.npmjs.com/package/jest | Mandatory | Testing framework |
| prettier | ^3.3.3 | MIT | https://www.npmjs.com/package/prettier | Mandatory | Code formatter |
| supertest | ^7.0.0 | MIT | https://www.npmjs.com/package/supertest | Mandatory | HTTP assertion library |
| ts-jest | ^29.2.5 | MIT | https://www.npmjs.com/package/ts-jest | Mandatory | TypeScript preprocessor for Jest |
| ts-node | ^10.9.2 | MIT | https://www.npmjs.com/package/ts-node | Mandatory | TypeScript execution for Node.js |
| ts-node-dev | ^2.0.0 | MIT | https://www.npmjs.com/package/ts-node-dev | Mandatory | TypeScript development server |
| typescript | ^5.9.3 | Apache-2.0 | https://www.npmjs.com/package/typescript | Mandatory | TypeScript compiler |

## License Summary

All dependencies use permissive open-source licenses:
- **MIT**: Most dependencies (bcrypt, express, jest, etc.)
- **BSD-2-Clause**: dotenv
- **BSD-3-Clause**: joi
- **ISC**: yaml
- **Apache-2.0**: typescript

All licenses are compatible with the MIT license used by CampusBot.

## License Verification

To verify licenses of installed packages:

```bash
npm list --depth=0
```

For detailed license information, check each package's `package.json` in `node_modules/` or visit the package's npm page.

## Security

All dependencies are regularly updated. Security vulnerabilities can be checked using:

```bash
npm audit
```

To fix vulnerabilities:

```bash
npm audit fix
```


