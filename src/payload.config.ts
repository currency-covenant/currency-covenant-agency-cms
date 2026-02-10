import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import { s3Storage } from "@payloadcms/storage-s3";
import { Media } from "./collections/Media";
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";

import { Pages } from "./collections/Pages";
import { Tenants } from "./collections/Tenants";
import Users from "./collections/Users";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";
import { isSuperAdmin } from "./access/isSuperAdmin";
import type { Config } from "./payload-types";
import { getUserTenantIDs } from "./utilities/getUserTenantIDs";
import { seed } from "./seed";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: "users",
  },
  collections: [Pages, Users, Tenants, Media],
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URL as string,
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  onInit: async (args) => {
    if (process.env.SEED_DB) {
      await seed(args);
    }
  },
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, "generated-schema.graphql"),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION,
        // ... Other S3 configuration
      },
    }),
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true;
            }
            return getUserTenantIDs(req.user).length > 0;
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
    formBuilderPlugin({
        formSubmissionOverrides: {
          access: {
            create: () => true,
          },
        },
      }),
  ],
});
