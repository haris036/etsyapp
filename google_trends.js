
const googleTrends = require('google-trends-api');
googleTrends.relatedQueries({keyword: '2017 Westminster Dog Show',startTime: new Date('2004-01-01'), endTime: new Date('2022-10-10')})
.then((res) => {
  console.log(res);
})
.catch((err) => {
  console.log(err);
})