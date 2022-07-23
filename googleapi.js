const googleTrends = require('google-trends-api');


googleTrends.interestOverTime({keyword: 'gta 5'})
.then(function(results){
  console.log(results);
})
.catch(function(err){
  console.error(err);
});