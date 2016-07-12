var facebookClientId,
    googleClientId,
    pixelId;

if (IS_PRODUCTION) {
  facebookClientId = '1762018427366535';
  googleClientId   = '783133684568-lgmtef1gfersdq4q8edtvh4gu4f9gslb.apps.googleusercontent.com';
  pixelId          = '1682201602042635';
} else {
  facebookClientId = '1095635343791580';
  googleClientId   = '783133684568-ogs5u3utle2mlfok7h8nldr72jpjdc5m.apps.googleusercontent.com';
  pixelId          = '1019605798121427';
}

module.exports = {
  facebook: {
    clientId: facebookClientId,
    pixelId: pixelId
  },
  google: {
    clientId: googleClientId
  }
};