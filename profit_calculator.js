var method = ProfitCalculator.prototype;
function ProfitCalculator() { }

method.calculateProfit = function (custPrice, custShippingPrice, custCoupon, laborCost, materialCost, shippingCost, etsyAds,
    renewing, offsideAdsFeePer) {

    
        custCoupon = !custCoupon ? 0 : custCoupon;
        custShippingPrice = !custShippingPrice?0:custShippingPrice;
        etsyAds = !etsyAds?0:etsyAds;
        offsideAdsFeePer = !offsideAdsFeePer?0:offsideAdsFeePer;
        renewing= !renewing?0:renewing;
        
    let cust_price = custPrice + custShippingPrice;
    let discounted_price = custCoupon == 0 ? 0 : (custPrice - (custCoupon * custPrice / 100) + custShippingPrice);
    let total_cost = laborCost + materialCost + shippingCost + etsyAds + renewing;
    let transaction_fee = (discounted_price == 0 ? cust_price : discounted_price) * 6.5 / 100;
    let payment_processing_fee = ((discounted_price == 0 ? cust_price : discounted_price) * 3 / 100) + 0.25;
    let offside_ads_fee = (discounted_price == 0 ? cust_price : discounted_price) * offsideAdsFeePer / 100;
    let total_fees = transaction_fee + payment_processing_fee + offside_ads_fee + 0.20;
    let estimated_profit = (discounted_price == 0 ? cust_price : discounted_price) - total_fees - total_cost;
    let estimated_margin = estimated_profit / (discounted_price == 0 ? cust_price : discounted_price) * 100;
    let result = {
        status: 200,
        cust_price: cust_price,
        discounted_price: discounted_price,
        total_cost: total_cost,
        transaction_fee: transaction_fee,
        payment_processing_fee: payment_processing_fee,
        total_fees: total_fees,
        estimated_profit: estimated_profit,
        estimated_margin: estimated_margin,
    }

    return result;
}


module.exports = ProfitCalculator;
