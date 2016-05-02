const chai = require("chai");
const sinon = require("sinon");

const assert = chai.assert;

describe("crypt", function () {
    const message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    const encryptedMessage = "d2ff3bdef96019ea565006d3cc993787f05fffcc64d77f5769f144f8878f6e8a9fda7021fdb31cb6811b49f2f3dad28f1537dabac6fd9fb9a3855e89c8be6b144038f1319e912ab1da82e449fd44f337ddf2b2dd214b8de234c0e32fe87ad7e03929bdd69a8129ab846195d54c9ee5d7402880d8a7301dacfb99828bf02f3e9d";
    var crypt;

    beforeEach(function () {
        crypt = require("../src/support/crypt");
    });

    it("encrypts", function () {
        var cipherText = crypt.encrypt(message, "monkey123");

        assert.equal(cipherText, encryptedMessage);
    });

    it("decrypts", function () {
        var plainText = crypt.decrypt(encryptedMessage, "monkey123");

        assert.equal(plainText, message);
    });
});
