// const Axios = require('axios');
// Axios.get(
//   `https://img.paulzzh.tech/touhou/random?type=json&site=all`
// )
//   .then(ret => {
    
//     console.log(ret.data);
//     // console.log(ret.file);
//   }
//     )
//   .catch(e => {});

const string = '来点东方竖屏壁纸';
console.log(string.replace(/(横屏|背景)/, 'pc'));
console.log(string.replace(/(横屏|背景)/, 'pc').replace(/(手机|竖屏)/, 'wap'));