import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Announcement: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      organization: a.string().required(),
      category: a.string().required(),
      expiresOn: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});