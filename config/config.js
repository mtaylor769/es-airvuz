var path = require('path'),
  rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    root: rootPath,
    app: {
      name: 'airvuz'
    },
    facebook: {
      clientID: "868675893230044",
      clientSecret: "916d3bbd7e46d2ff4ae05d173aef4cd7",
      callbackURL: "http://localhost/api/socialmedia/facebook/callback"
    },
    linkedIn: {
      clientID: "test",
      clientSecret: "test",
      callbackURL: "http://localhost/auth/linkedin/callback"
    },

    google_localhost: {
        clientID        : "257509599064-3omlk38mtq8e3upm55eemp8q7hk1pqg6.apps.googleusercontent.com",
        clientSecret    : "DPdvaCrEoP2p6Jc7tzn5QOzP",
        callbackURL     : "http://localhost/auth/google/callback"
    },
    google: {
      "clientID": "257509599064-3omlk38mtq8e3upm55eemp8q7hk1pqg6.apps.googleusercontent.com",
      "clientSecret": "DPdvaCrEoP2p6Jc7tzn5QOzP",
      "callbackURL": "http://localhost/auth/google/callback"
    },

    twitter_local: {
    clientID: "o1k5SYvBtqZOluOuZ5FP9YMja",
    clientSecret: "87Tpccs9rv0NPDCiKCie4biCyAjV1bWMkVaCTTCG1G5qFP1jGD",
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
   }, 
   
    twitter: {
      clientID: "NriwXWU7qTx47bsxlexZLg6aJ",
      clientSecret: "Y65uFqPE2oT2xE9wMxbbPGXXkGmJlhrYSGMGYcQy7JsiUBC7hQ",
      callbackURL: "http://localhost/auth/twitter/callback"
    }

  },
  production: {
    root: rootPath,
    app: {
      name: 'airvuz'
    },
    facebook: {
      clientID: "441356432709973",
      clientSecret: "e76efd4ccddb3ed7deb6968f1b27f6ee",
      callbackURL: "http://airvuz.com/auth/facebook/callback"
    },
    linkedIn: {
      clientID: "test",
      clientSecret: "test",
      callbackURL: "http://ec2-52-10-141-239.us-west-2.compute.amazonaws.com/auth/linkedin/callback"
    },
    google: {
      "clientID": "783133684568-lgmtef1gfersdq4q8edtvh4gu4f9gslb.apps.googleusercontent.com",
      "clientSecret": "1xA-DeneT3IT2Ek-SGaHjnyB",
      "callbackURL": "http://airvuz.com/auth/google/callback"
    },
    twitter: {
      clientID: "NriwXWU7qTx47bsxlexZLg6aJ",
      clientSecret: "Y65uFqPE2oT2xE9wMxbbPGXXkGmJlhrYSGMGYcQy7JsiUBC7hQ",
      callbackURL: "http://airvuz.com/auth/twitter/callback"
    }
  },
  beta: {
    root: rootPath,
    app: {
      name: 'airvuz'
    },

     google: {
      "clientID": "783133684568-ogs5u3utle2mlfok7h8nldr72jpjdc5m.apps.googleusercontent.com",
      "clientSecret": "vJM7NvyWkpjom_bpubWuWLJP",
      "callbackURL": "http://beta.airvuz.com/auth/google/callback"
    },

    facebook: {
      clientID: "868675893230044",
      clientSecret: "916d3bbd7e46d2ff4ae05d173aef4cd7",
      callbackURL: "http://beta.airvuz.com/auth/facebook/callback"
    },
    linkedIn: {
      clientID: "test",
      clientSecret: "test",
      callbackURL: "http://ec2-52-10-141-239.us-west-2.compute.amazonaws.com/auth/linkedin/callback"
    },
    twitter: {
      clientID: "NriwXWU7qTx47bsxlexZLg6aJ",
      clientSecret: "Y65uFqPE2oT2xE9wMxbbPGXXkGmJlhrYSGMGYcQy7JsiUBC7hQ",
      callbackURL: "http://airvuz.com/auth/twitter/callback"
    }
  }
};
