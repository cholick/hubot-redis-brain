const crypto = require('crypto');

const algorithm = 'aes256';

function encrypt(plainText, key) {
    var cipher = crypto.createCipher(algorithm, key);
    return cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(cipherText, key) {
    var decipher = crypto.createDecipher(algorithm, key);
    try {
        return decipher.update(cipherText, 'hex', 'utf8') + decipher.final('utf8')
    } catch (err) {
        console.log("Failed to decrypt");
        console.log(cipherText);
        throw err;
    }
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
};
