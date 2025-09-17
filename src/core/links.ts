// prefixes
export const LINK_PREFIXES = [
  "http://localhost:8082",
  "https://localhost:8082",
  "exp://127.0.0.1:19000",
  "nuntium://",
];

// config
export const LINKING_CONFIG = {
  prefixes: LINK_PREFIXES,
  config: {
    screens: {
      Login: "login",
      Register: "register",
      VerifyEmail: {
        path: "verified",
        parse: { email: (v: string) => v },
      },
      ResetPassword: {
        path: "reset-password",
      },
      App: {
        path: "",
        screens: {
          Feed: "feed",
          Events: "events",
          Groups: "groups",
          Messages: "messages",
          Profile: "profile",
          Help: "help",
        },
      },
    },
  },
};
