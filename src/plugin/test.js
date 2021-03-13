const Axios = require('axios');
Axios.get(
  `https://img.paulzzh.tech/touhou/random?type=json&site=all`
)
.then(ret => ret.data)
  .then(ret => {
    
    console.log(ret.file);
  }
    )
  .catch(e => {});
