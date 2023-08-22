
const googleTrends = require('google-trends-api');
let startTime= new Date(Date.now() - 31556926 * 1000.0)
console.log(startTime.toISOString())
googleTrends.interestOverTime({ keyword: 'Playstation 4', startTime: new Date('2022-07-26' ) }, function (err, results) {
  if (err) console.log('oh no error!', err);
  else console.log(results);
});