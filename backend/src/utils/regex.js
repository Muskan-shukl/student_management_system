// Escape user input before embedding it in a RegExp (prevents ReDoS / injection).
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchRegex = (value) => new RegExp(escapeRegex(value), 'i');

module.exports = { escapeRegex, searchRegex };
