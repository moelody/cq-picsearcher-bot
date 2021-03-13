// const Axios = require('axios');
// Axios.get(
//   `https://img.paulzzh.tech/touhou/random?type=json&site=all`
// )
// .then(ret => ret.data)
//   .then(ret => {
    
//     console.log(ret);
//   }
//     )
//   .catch(e => {});

console.log(new URL(/(?<=https:\/\/pixiv\.net\/i\/).+/.exec('https://pixiv.net/i/' + '24336')[0], "https://i.pixiv.cat/").toString())