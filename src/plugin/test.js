const Axios = require('axios');
Axios.get(
  `https://api.lolicon.app/setu?r18=1&apikey=428162325e931c57f02bf5`
)
  .then(ret => {
    
    console.log(ret);
    // console.log(ret.file);
  }
    )
  .catch(e => {});