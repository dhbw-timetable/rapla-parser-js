module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "sourceType": "module",
      "ecmaFeatures": {
        "experimentalObjectRestSpread": true
      }
  },
  "rules": {
      "no-console": ["error", { "allow": ["log", "warn", "error"] }],
      "indent": [ "error", 2 ],
      "linebreak-style": [ "error", "unix" ],
      "quotes": [ "error", "single", { "allowTemplateLiterals": true } ],
      "semi": [ "error", "always" ]
  }
};