const Axios = require('axios');
Axios.get(
  `https://img.paulzzh.tech/touhou/random?type=json&site=all`
)
  .then(ret => {
    
    console.log(ret.data);
    // console.log(ret.file);
  }
    )
  .catch(e => {});