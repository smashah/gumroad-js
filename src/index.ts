import axios from 'axios';
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
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

export type ResourceSubscriptionType = "sale" | "refund" | "dispute" | "dispute_won" | "cancellation" | "subscription_updated" | "subscription_ended" | "subscription_restarted"

export interface custom_fields_object {
    [k: string]: string | number | null | boolean
}


// Define a type for the Gumroad sale data
export interface GumroadSaleData {
    sale_id: string; // The id of the sale
    sale_timestamp: string; // The timestamp of the sale
    order_number: number; // Numeric version of sale_id
    seller_id: string; // The id of the seller
    product_id: string; // The id of the product
    product_permalink: string; // The permalink of the product
    short_product_id: string; // Unique identifier for the product
    product_name: string; // The name of the product
    email: string; // The email of the buyer
    url_params?: { [key: string]: string }; // URL parameters
    full_name?: string; // The name of the buyer
    purchaser_id?: string; // The id of the purchaser's Gumroad account, if the purchaser has one
    subscription_id?: string; // The id of the subscription, if the purchase is part of a subscription
    ip_country?: string; // The country of the buyer's IP address
    price: number; // The price paid, in USD cents
    recurrence?: string; // The recurrence of the payment option chosen by the buyer such as 'monthly', 'yearly', etc
    variants?: { [key: string]: string }; // A dictionary of product variants
    offer_code?: string; // The offer code used for the sale
    test?: boolean; // Whether the sale is a test sale
    custom_fields?: { [key: string]: string }; // A dictionary of custom fields
    shipping_information?: { [key: string]: string }; // A dictionary of shipping information
    is_recurring_charge?: boolean; // Whether the sale is a recurring charge
    is_preorder_authorization?: boolean; // Whether the sale is a preorder authorization
    license_key?: string; // The license key for the product, if licenses are enabled
    quantity?: number; // The quantity of the product purchased
    shipping_rate?: number; // The shipping paid, in USD cents, if the product is a physical product
    affiliate?: string; // The email address of the affiliate, if present
    affiliate_credit_amount_cents?: number; // The amount paid to the affiliate in USD cents, if present
    is_gift_receiver_purchase?: boolean; // Whether the sale is a gift receiver purchase
    gifter_email?: string; // The email address of the gifter, if present
    gift_price?: number; // The price paid by the gifter, in USD cents, if present
    refunded?: boolean; // Whether the sale has been refunded
    discover_fee_charged?: boolean; // Whether the sale was subject to Gumroad Discover fees
    can_contact?: boolean; // Whether the buyer can be contacted
    referrer?: string; // The referrer, if present
    gumroad_fee: number; // Gumroad's fee, in USD cents
    card?: Card; // Payment instrument details
}

/**
 * Represents a cancelled subscription to a Gumroad resource.
 */
export interface CancelledSubscription {
    /**
     * True if subscription has been cancelled, otherwise false.
     */
    cancelled: boolean;
    /**
     * Timestamp at which subscription will be cancelled.
     */
    cancelled_at: string;
    /**
     * True if subscription was cancelled by admin, otherwise not present.
     */
    cancelled_by_admin?: boolean;
    /**
     * True if subscription was cancelled by buyer, otherwise not present.
     */
    cancelled_by_buyer?: boolean;
    /**
     * True if subscription was cancelled by seller, otherwise not present.
     */
    cancelled_by_seller?: boolean;
    /**
     * True if subscription was cancelled automatically because of payment failure, otherwise not present.
     */
    cancelled_due_to_payment_failures?: boolean;
}

/**
 * Represents a subscription to a Gumroad resource.
 */
export interface GumroadSubscriptionData {
    /**
     * The ID of the subscription.
     */
    subscription_id: string;
    /**
     * The ID of the product.
     */
    product_id: string;
    /**
     * The name of the product.
     */
    product_name: string;
    /**
     * The user ID of the subscriber.
     */
    user_id: string;
    /**
     * The email address of the subscriber.
     */
    user_email: string;
    /**
     * An array of charge IDs belonging to this subscription.
     */
    purchase_ids: string[];
    /**
     * The timestamp when the subscription was created.
     */
    created_at: string;
    /**
     * The number of charges made for this subscription.
     */
    charge_occurrence_count: number;
    /**
     * The subscription duration - monthly/quarterly/biannually/yearly.
     */
    recurrence: string;
    /**
     * The timestamp when the free trial ends, if free trial is enabled for the membership.
     */
    free_trial_ends_at?: string;
    /**
     * Custom fields from the original purchase.
     */
    custom_fields?: { [key: string]: string };
    /**
     * The license key from the original purchase.
     */
    license_key?: string;
}
// Define a type for the card data
export interface Card {
    visual: string; // The visual representation of the card
    type: string; // The type of card
    bin?: any; // The BIN (Bank Identification Number) of the card
    expiry_month: number; // The expiry month of the card
    expiry_year: number; // The expiry year of the card
}
/**
 * Represents the "subscription_ended" resource in Gumroad's webhook payload.
 */
export interface SubscriptionEndedData {
    /**
     * The timestamp at which the subscription ended.
     */
    ended_at: string;
    /**
     * The reason for the subscription ending ("cancelled", "failed_payment", or "fixed_subscription_period_ended").
     */
    ended_reason: "cancelled" | "failed_payment" | "fixed_subscription_period_ended";
}

/**
 * Represents the "subscription_restarted" resource in Gumroad's webhook payload.
 */
export interface SubscriptionRestartedData {
    /**
     * The timestamp at which the subscription was restarted.
     */
    restarted_at: string;
}
export interface GumroadWebhookPayload {
    sale: GumroadSaleData & GumroadSubscriptionData,
    refund: GumroadSaleData & GumroadSubscriptionData,
    dispute: GumroadSaleData & GumroadSubscriptionData,
    dispute_won: GumroadSaleData & GumroadSubscriptionData,
    cancellation : GumroadSubscriptionData & CancelledSubscription,
    subscription_updated: SubscriptionUpdateData & GumroadSubscriptionData,
    subscription_ended: SubscriptionEndedData & GumroadSubscriptionData,
    subscription_restarted: SubscriptionRestartedData & GumroadSubscriptionData,
}

export interface SubUpdateTierInfo {
        /**
         * The tier of the subscription before the change.
         */
        tier: { id: string, name: string };
        /**
         * The subscription duration before the change.
         */
        recurrence: string;
        /**
         * The price of the subscription before the change.
         */
        price_cents: number;
        /**
         * The quantity of the subscription before the change.
         */
        quantity: number;
    }

/**
 * Represents the data for a subscription update event.
 */
export interface SubscriptionUpdateData {
    /**
     * The type of subscription update - upgrade or downgrade.
     */
    type: "upgrade" | "downgrade";
    /**
     * The timestamp at which the change went or will go into effect.
     */
    effective_as_of: string;
    /**
     * The details of the subscription before the change.
     */
    old_plan: SubUpdateTierInfo;
    /**
     * The details of the subscription after the change.
     */
    new_plan: SubUpdateTierInfo
}

/**
 * Represents a subscription to a Gumroad resource.
 */
export interface ResourceSubscription {
    /**
     * The ID of the resource subscription.
     */
    id: string
    /**
     * The type of resource that the subscription is for.
     */
    resource_name: ResourceSubscriptionType
    /**
     * The URL of the webhook that will be called when the event occurs.
     */
    post_url: string
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

    async getTotalRevenue() {
        const charges = await this.getCharges();
        return charges.reduce((x,y)=>x+y.price,0)
    }

}

/**
 * A client for interacting with the Gumroad API.
 */
export class GumroadClient {

    private product_id?: string;
    private apiUrl: string = "https://gumroad.com/api/v2";
    #access_token = "";
    #cookie?: string = "";

    /**
     *  @param access_token Gumroad API access token
     * @param product_id Gumroad product id
     * @param cookie Gumroad cookie You can get this from the browser when you're logged in to gumroad.
     */
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
        const config = {
            method,
            url: `${this.apiUrl}/${endpoint}`,
            params: {
                access_token: this.#access_token,
                ...(method === "GET" && _data || {})
            },
            data: _data,
            headers
        }
        // @ts-ignore
        if(fetch) config.adapter = fetchAdapter
        const { data, status } = await axios(config);
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

    /**
     * Show all active subscriptions of user for the input resource.
     * @param resource_name optional. The name of the resource to filter by. "sale", "refund", "dispute", "dispute_won", "cancellation", "subscription_updated", "subscription_ended", and "subscription_restarted"
     * @returns 
     */
    public async getResourceSubscriptions(resource_name : ResourceSubscriptionType) : Promise<ResourceSubscription[]> {
        let url = `resource_subscriptions`
        if(resource_name) url += `/?resource_name=${resource_name}`
        const subscriptions = await this.req('GET', url) as GumroadApiResponseWrapperInterface & {
            resource_subscriptions: ResourceSubscription[]
        }
        return subscriptions.resource_subscriptions
    }

    /**
     * Ensure a resource subscription exists. If it does not exist, create it.
     * @param resource_name The name of the resource to subscribe to. "sale", "refund", "dispute", "dispute_won", "cancellation", "subscription_updated", "subscription_ended", and "subscription_restarted"
     * @param post_url
     * @returns
     */
    public async ensureResourceSubscription(resource_name: ResourceSubscriptionType, post_url: string) : Promise<ResourceSubscription> {
        const subscriptions = await this.getResourceSubscriptions(resource_name)
        const existingSubscription = subscriptions.find(subscription => subscription.post_url === post_url)
        if(existingSubscription) return existingSubscription
        return await this.createResourceSubscription(resource_name, post_url)
    }

    /**
     * Delete a resource subscription.
     * @param subscription_id The ID of the resource subscription to delete.
     * @returns 
     */
    public async deleteResourceSubscription(subscription_id: string) : Promise<string> {
        const response = await this.req('DELETE', `resource_subscriptions/${subscription_id}`) as GumroadApiResponseWrapperInterface & {
            message: string
                }
        return response.message
    }


    /**
     * Create a resource subscription (register a webhook)
     * @param resource_name The name of the resource to subscribe to. "sale", "refund", "dispute", "dispute_won", "cancellation", "subscription_updated", "subscription_ended", and "subscription_restarted"
     * @param post_url 
     * @returns 
     */
    public async createResourceSubscription(resource_name: ResourceSubscriptionType, post_url: string) : Promise<ResourceSubscription> {
        const response = await this.req('PUT', `resource_subscriptions`, {
            resource_name,
            post_url
        }) as GumroadApiResponseWrapperInterface & {
            resource_subscription: ResourceSubscription
        }
        return response.resource_subscription
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

    /**
     * @TODO not finished
     * @param email 
     * @param product_id 
     */
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

    /**
     * Check if the email address provided is a subscriber of the given product id.
     * @param email the email to check
     * @param product_id the gumroad product id (e.g BTMt)
     * @returns boolean
     */
    public async getSubscription(subscription_id: string): Promise<Subscription> {
        const subscriptionResponse = await this.req('GET', `subscribers/${subscription_id}`)
        if (subscriptionResponse.success) {
            const subscription = subscriptionResponse.subscriber as Subscription;
            return subscription
        }
        throw new Error("Subscription request error", subscriptionResponse)
    }

}