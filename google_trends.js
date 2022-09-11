
const googleTrends = require('google-trends-api');
googleTrends.dailyTrends({
    trendDate: new Date('2022-09-01'),
    geo: 'US',
  }, function(err, results) {
    if (err) {
      console.log(err);
    }else{
      console.log(results);
    }
  });