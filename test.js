require('dotenv').config()
const { GumroadClient } =  require('./lib/index.js')
const product_id = `${process.env.GR_PRODUCT_ID}`
const grc = new GumroadClient(`${process.env.GR_ACCESS_TOKEN}`,product_id, process.env.GR_COOKIE)

const test = require('ava');
test('Test is Subscription', async t => {
    const isEmSub = await grc.emailIsSubscriber(`${process.env.GR_EM_CHECK}`,product_id)
	t.is(isEmSub, true);
});

test("Get a license", async t => {
    const license = await grc.getLicense(process.env.GR_LIC, product_id)
    t.truthy(license)
    const status = await license.getStatus();
    t.truthy(status);
    const isValid = await license.isValid();
    t.truthy(isValid)
    //get the total revenue from the first item in the purchases array
    const totalRev = await license.getTotalRevenue()
    t.is(totalRev, 0)
})

test("Check Cancelled license", async t => {
    const license = await grc.getLicense(process.env.GR_LIC_CANCELLED, product_id)
    t.truthy(license)
    const status = await license.getStatus();
    t.is(status, 'cancelled');
    await t.throwsAsync(async () => {
        const isValid = await license.isValid();
    }, {instanceOf: Error, message: 'INVALID SUBSCRIPTION: cancelled'});
    const charges = await license.getCharges()
    t.truthy(charges.length)
    const totalRev = await license.getTotalRevenue()
    t.is(totalRev, 16341)
})

test("Advanced search", async t => {
    console.log("using cookie:", process.env.GR_COOKIE)
    const searchPurchases = await grc.searchPurchases(process.env.GR_SEARCH_QUERY)
    // console.log("🚀 ~ file: test.js ~ line 31 ~ searchPurchases", searchPurchases)
    t.truthy(searchPurchases.length > 2)
    /**
     * All search results have a license key
     */
     searchPurchases.map((purchase)=> t.truthy(purchase.license_key))
     
})