import axios from 'axios';
/**
 * Gumroad API requires:
 * Product ID
 * License Key
 */

export interface InvalidCases {
    /**
     * Set this to true if you consider outstanding payments a marker for an invalid license.
     */
    outstanding_payments: boolean
}

export interface Variants {
    Tier: string;
}

export interface Card {
    visual: string;
    type: string;
    bin?: any;
    expiry_month: number;
    expiry_year: number;
}

export type custom_fields_array = string[]

export interface custom_fields_object {
    [k: string]: string | number | null | boolean
}

export interface Purchase {
    id: string;
    email: string;
    seller_id: string;
    timestamp: string;
    daystamp: string;
    created_at: Date;
    product_name: string;
    product_has_variants: boolean;
    price: number;
    gumroad_fee: number;
    subscription_duration: string;
    formatted_display_price: string;
    formatted_total_price: string;
    currency_symbol: string;
    amount_refundable_in_currency: string;
    product_id: string;
    product_permalink: string;
    refunded: boolean;
    partially_refunded: boolean;
    chargedback: boolean;
    purchase_email: string;
    full_name: string;
    state: string;
    country: string;
    paid: boolean;
    has_variants: boolean;
    variants: Variants;
    variants_and_quantity: string;
    has_custom_fields: boolean;
    custom_fields: custom_fields_object;
    order_id: number;
    is_product_physical: boolean;
    purchaser_id: string;
    is_recurring_billing: boolean;
    can_contact: boolean;
    is_following: boolean;
    disputed: boolean;
    dispute_won: boolean;
    is_additional_contribution: boolean;
    discover_fee_charged: boolean;
    is_upgrade_purchase: boolean;
    is_gift_sender_purchase: boolean;
    is_gift_receiver_purchase: boolean;
    referrer: string;
    card: Card;
    product_rating?: any;
    reviews_count: number;
    average_rating: number;
    subscription_id: string;
    cancelled: boolean;
    dead: boolean;
    ended: boolean;
    free_trial_ended?: any;
    free_trial_ends_on?: any;
    recurring_charge: boolean;
    receipt_url: string;
    license_key?: string;
    license_id?: string;
    is_multiseat_license : boolean;
    license_disabled: boolean;
    quantity: number;
}

export interface GumroadSubscriptionChargesResponseInterface {
    success: boolean,
    remaining_charges_count: number,
    fixed_length_subscription: boolean,
    recurring_purchases: Purchase[]
}

export interface GumroadLicenseResponseInterface {
    success: boolean,
    uses: number,
    purchase: Purchase & custom_fields_object
}

export interface Subscription {
    id: string
    email: string
    product_id: string
    product_name: string
    user_id: string
    user_email: string
    purchase_ids: string[]
    created_at: string
    user_requested_cancellation_at: any
    charge_occurrence_count: any
    recurrence: string
    cancelled_at: any
    ended_at: any
    failed_at: any
    free_trial_ends_at: any
    status: "alive" | "pending_failure" | "failed_payment" | "fixed_subscription_period_ended" | "cancelled"
}

export interface GumroadApiResponseWrapperInterface {
    success: boolean,
}

enum INVALID_LICENSE_REASONS {
    OUTSTANDING_PAYMENTS = 'outstanding_payments',
    INVALID_LICENSE_KEY = 'invalid_license_key',
    CANCELLED_LICENSE = 'cancelled_license',
    EXPIRED_LICENSE = 'expired_license',
}

export class InvalidLicenseError extends Error {


    constructor(message: INVALID_LICENSE_REASONS) {
        super(message);
        this.name = 'InvalidLicenseError';
    }
}


export class GumroadLicense {
    client: GumroadClient;
    initiatingPurchase: Purchase;
    subscriptionId: string;
    subscription?: Subscription;
    purchases?: Purchase[];

    constructor(initiatingPurchase: Purchase, client: GumroadClient) {
        this.client = client
        this.initiatingPurchase = initiatingPurchase
        this.subscriptionId = this.initiatingPurchase.subscription_id
    }

    async getCharges() {
        return this.getPurchases()
    }

    async getPurchases() {
        if (!this.purchases) {
            const purchases = await this.client.getSubscriptionPurchases(this.subscriptionId)
            this.purchases = purchases;
        }
        return this.purchases;
    }

    async getSubscription() {
        if (!this.subscription) {
            const subscription = await this.client.getSubscription(this.subscriptionId)
            this.subscription = subscription;
        }
        return this.subscription
    }

    async isValid(invalidCases?: InvalidCases) {
        const status = await this.getStatus()
        if (status === "alive") {
            return true;
        }
        throw new Error(`INVALID SUBSCRIPTION: ${status}`)
    }

    async getStatus() {
        const subscription = await this.getSubscription();
        return subscription.status;
    }

}

export class GumroadClient {

    private product_id?: string;
    private apiUrl: string = "https://gumroad.com/api/v2/";
    #access_token = "";
    #cookie?: string = "";

    constructor(access_token: string, product_id?: string, cookie?: string) {
        this.product_id = product_id;
        this.#access_token = access_token;
        this.#cookie = cookie;
    }

    public async req(method: 'PUT' | 'POST' | 'GET' | 'DELETE', endpoint: string, _data: any = {}, headers: any = {}) {
        headers = {
            "Content-type": "application/json",
            ...headers,
        }
        const { data, status } = await axios({
            method,
            url: `${this.apiUrl}/${endpoint}`,
            params: {
                access_token: this.#access_token,
                ...(method === "GET" && _data || {})
            },
            data: _data,
            headers
        });
        if (data?.success && status === 200) return data
        throw new Error(`Gumroad API returned ${status}, ${data?.success}`);
    }

    public async cookieRequest(method: 'PUT' | 'POST' | 'GET' | 'DELETE', endpoint: string, _data: any = {}, headers: any = {}) {
        headers = {
            "Content-type": "application/json",
            "cookie": this.#cookie || "",
            ...headers,
        }
        const { data, status } = await axios({
            method,
            url: `https://app.gumroad.com/${endpoint}`,
            params: {
                ...(method === "GET" && _data || {})
            },
            data: _data,
            headers
        });
        if (status === 200) return data
        throw new Error(`Gumroad API returned ${status}, ${data}`);
    }

    public async getLicense(license_key: string, product_id: string): Promise<GumroadLicense> {
        if (!product_id && !this.product_id) throw new Error("No product ID provided");
        const url = `licenses/verify`
        const product_permalink = product_id || this.product_id;
        const licData = (await this.req('POST', url, {
            product_permalink,
            license_key
        })) as GumroadLicenseResponseInterface;
        return new GumroadLicense(licData.purchase, this)
    }

    /**
     * Get the array of purchases within a given subscription. Each monthly charge for a subscription is it's own purchase object.
     * 
     * @param subscription_id the id of the subscription.
     * @returns 
     */
    public async getSubscriptionPurchases(subscription_id: string): Promise<Purchase[]> {
        const charges = await this.cookieRequest('GET', `customers/subscription_recurring_purchases/${subscription_id}`) as GumroadSubscriptionChargesResponseInterface
        return charges.recurring_purchases
    }

    /**
     * Returns an array of FIRST purchase objects for subscribers.
     * 
     * The license key is a property of only the first purchase within a subscription. This seems like a bug.
     * 
     * Remember, a subscription is made up of an array of monthly recurring purchases.
     * 
     * @param query the search query (a.k.a email)
     * @returns 
     */
    public async searchPurchases(query: string): Promise<Purchase[]> {
        const matchingPurchases = await this.cookieRequest('GET', `purchases/search?query=${query}`);
        return matchingPurchases
    }

    /**
     * Grab the subscriptions of the email provided.
     * 
     * The issue with this is that the subscription object does not return the license key.
     * 
     * So instead you have to use `searchPurchases` to get a purchase object which includes a subscription ID and the license key.
     * 
     * Interestingly, a license key is a property of a the first purchase within a subscription.
     * 
     * @param email optionally filter by email
     * @param product_id override existing product id
     * @returns 
     */
    public async getSubscriptions(email?: string, product_id?: string): Promise<Subscription[]> {
        product_id = product_id || this.product_id
        const subscriptions = await this.req('GET', `products/${product_id}/subscribers`, {
            email
        }) as GumroadApiResponseWrapperInterface & {
            subscribers: Subscription[]
        }
        return subscriptions.subscribers
    }

    public async getLicensesWithSubscriptionDetailsByEmail(email: string, product_id?: string) {
        product_id = product_id || this.product_id
        const purchases = await this.searchPurchases(email)
        /**
         * Grab all subscriptions and their relevant licenses, return array of licenses.
         */
        purchases.map(purchase => {
            /**
             * Each of these purchases represent the FIRST purchase on a subscription so they should all include a license key.
             */

        })
    }

    /**
     * Check if the email address provided is a subscriber of the given product id.
     * @param email the email to check
     * @param product_id the gumroad product id (e.g BTMt)
     * @returns boolean
     */
    public async emailIsSubscriber(email: string, product_id ?: string): Promise<boolean> {
        const subscriptions = await this.getSubscriptions(email, product_id);
        if (subscriptions.length) return true;
        return false;
    }

    public async getSubscription(subscription_id: string): Promise<Subscription> {
        const subscriptionResponse = await this.req('GET', `subscribers/${subscription_id}`)
        if (subscriptionResponse.success) {
            const subscription = subscriptionResponse.subscriber as Subscription;
            return subscription
        }
        throw new Error("Subscription request error", subscriptionResponse)
    }

}