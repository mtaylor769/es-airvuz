var facebookClientId,
    googleClientId,
    pixelId,
    googleTrackingId,
    googleTagManagerId;

if (IS_PRODUCTION) {
  facebookClientId = '1762018427366535';
  googleClientId   = '783133684568-lgmtef1gfersdq4q8edtvh4gu4f9gslb.apps.googleusercontent.com';
  pixelId          = '1682201602042635';
  googleTrackingId = 'UA-67060276-2';
  googleTagManagerId = 'GTM-WNN2PJ';
  googleMapsKey    = 'AIzaSyCay71RPraZjzSjQ5oXWaVRdpd-n21XD3g';
} else {
  facebookClientId = '1095635343791580';
  googleClientId   = '783133684568-ogs5u3utle2mlfok7h8nldr72jpjdc5m.apps.googleusercontent.com';
  pixelId          = '1019605798121427';
  googleTrackingId = 'UA-80777160-1';
  googleTagManagerId = 'GTM-KWVNMW';
  googleMapsKey    = 'AIzaSyCeB8e-WQUsrTI0qGFj2syiubFvUrASExY';
}

module.exports = {
  facebook: {
    clientId: facebookClientId,
    pixelId: pixelId
  },
  google: {
    clientId: googleClientId,
    trackingId: googleTrackingId,
    tagManagerId: googleTagManagerId,
    googleMapsKey: googleMapsKey
  }
};