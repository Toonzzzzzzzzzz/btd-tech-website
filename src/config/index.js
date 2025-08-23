const ConfDev = require('./development.json');
const ConfPro = require('./production.json');

export default (() => {
    if (process.env.NODE_ENV === 'development') {
        return ConfDev;
    } else {
        return ConfPro;
    }
})();
