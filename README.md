# etsyapp
  etsy app is a tool to improve your etsy product seo. It will provide you following apis.
  
## apis
### Get Listing
    It is an api to provide you search results of products against your provided keyword
    https://eprimedata.com/api/v1/getListing/ps4
    result = {
        items: items lists cotaining  item edtails,
        popular_tags: popular tags against resulted products,
        item_pricing: it is mapping of item prices,
        historical_metrices: it is historical search graph against keyword,
        long_tail_keyword: boolean value of long tail keyword,
        competition: competition of items against keyword,
        shipping_day_prices: it is a graph of shipping days against items ,
        shipping_prices: it is pricing graph of shipping,
        shipping_days: it is shipping days graph ,
        long_tail_alternatives: it is alternatives of the keyword,
        material_items: it is a graph related to material used in making the item,
        avg_searches: average search untill now,
        searches: total searches,
        favourites: favourite count,
        average_price: average_price,
        similar_shopper_searches: it is data of same item against keyword,
      }
### single lisiting
    It is data of single item.
    https://eprimedata.com/api/v1/getSingleListing/1336559064
    
      item = {
            listing_id: id of the item,
            title,
            description
            state: state of the item,
            title_characters: total characters count
            descripiton_characters: total charactar count used in description,
            words_in_title: total words used in title,
            quantity: quantity of the item,
            tags_data: related tags data,
            url,
            num_favorers: favorers count,
            tags,
            materials: materials used in making items
            categoryyh,
            price, 
            views,
            creation_time,
            images,
            shipping_infos,
            age,
            monthly_views,
            last_modified,
            expires_on,
        }
        
##profit calculator
    https://eprimedata.com/api/v1/calculateProfit?cust_price=1&cust_shipping_price=1&cust_coupon=0&labor_cost=0&material_cost=0&shipping_cost=0&etsy_ads=0&renewing=0&offside_ads_fee_per=0
    
    
    cust_price,
    discounted_price,
    total_cost,
    transaction_fee,
    payment_processing_fee,
    total_fees,
    estimated_profit,
    estimated_margin,
    
###sign up
    https://eprimedata.com/api/v1/signUp?email=haris.arif103@gmail.com&password=12345678&is_subscribed=N
    
    response = {
      user: user_id,
      inserted_id,
    }
    
### sign in
    https://eprimedata.com/api/v1/signIn?email=haris.arif103@gmail.com&password=1234
    
    user,
        password,
        creation_time,
        email,
        is_subscribed,
        last_updated,
        expiry,
        
###change password
    https://eprimedata.com/api/v1/changePassword?email=haris.arif103@gmail.com&password=43122
    
    {msg: "Updated"}
    
###update subscribtion
    https://eprimedata.com/api/v1/updateSubsciption?email=haris.arif103@gmail.com&is_subscribed=Y
    
    {msg: "Updated"}
    
###calender holidays
    https://eprimedata.com/api/v1/calenderHolidays
    
    country_holidays result 
    
    holiday = {
        name: holiday name,
        description: holiday description,
        country: holiday country name,
        date: holiday date,
    }
