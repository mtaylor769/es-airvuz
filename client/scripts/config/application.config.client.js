var facebookClientId,
    googleClientId;

if (IS_PRODUCTION) {
  facebookClientId = '1762018427366535';
  googleClientId   = '783133684568-lgmtef1gfersdq4q8edtvh4gu4f9gslb.apps.googleusercontent.com';
} else {
  facebookClientId = '1095635343791580';
  googleClientId   = '783133684568-ogs5u3utle2mlfok7h8nldr72jpjdc5m.apps.googleusercontent.com';
}

module.exports = {
  facebook: {
    clientId: facebookClientId
  },
  google: {
    clientId: googleClientId
  }
};