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

export interface GumroadSubscriptionChargesResponseInterface {
    success: boolean,
    remaining_charges_count: number,
    fixed_length_subscription: boolean,
    recurring_purchases: {
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
        license_key: string;
        license_id: string;
        license_disabled: boolean;
        quantity: number;
    }[]
}

export interface GumroadLicenseResponseInterface {
    success: boolean,
    uses: number,
    purchase: {
        "seller_id": string, //"20X1234N76AxDg==",
        "product_id": string, //"RA1234seVnw==",
        "product_name": string, //"open-wa License Keys",
        "permalink": string, //"open-wa",
        "product_permalink": string, //"https://s1234ah.gumroad.com/l/open-wa",
        "short_product_id": string, //"BTMt",
        "email": string, //"fmssss95@gmail.com",
        "price": number, //981,
        "gumroad_fee": string, //74,
        "currency": string, //"gbp",
        "quantity": number, //1,
        "discover_fee_charged": boolean, //false,
        "can_contact": boolean, //true,
        "referrer": string, //"direct",
        "card": Card,
        "order_number": number, //112347571,
        "sale_id": string, //"ZnunF6BL1234XGw==",
        "sale_timestamp": string, //"2020-05-13T01:24:06Z",
        "full_name": string, //"John Smith",
        "subscription_id": string, //"AbCpj1234ssssTPUQ==",
        "variants": string, //"(1 Restricted License Key)",
        "offer_code": {
            "name": string, //"9h23bsd",
            "displayed_amount_off": string, //"20%"
        } | undefined,
        "Github Username": string, //"fsssc",
        "Number (e.g 447712345678)": string, //"48s123492",
        "Reason/Use case": string, //"Wbla bla bla bla.",
        "custom_fields": custom_fields_array | undefined,
        "license_key": string, //"C1234A-4SSSS2E-B312342-D1324E1",
        "ip_country": string, //"Germany",
        "recurrence": string, //"monthly",
        "is_gift_receiver_purchase": boolean, //false,
        "refunded": boolean, //false,
        "disputed": boolean, //false,
        "dispute_won": boolean, //false,
        "id": boolean, //"ZnunF61234kvXGw==",
        "created_at": string | null, //"2020-05-13T01:24:06Z",
        "subscription_ended_at": string | null, //null,
        "subscription_cancelled_at": string | null, //"2020-12-13T01:25:04Z",
        "subscription_failed_at": string | null
    } & custom_fields_object
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
    status: string
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
    data: GumroadLicenseResponseInterface;
    constructor(data: GumroadLicenseResponseInterface, client: GumroadClient) {
        this.data = data;
        this.client = client
    }

    async getCharges() {
        const charges = await this.client.getSubscriptionCharges(this.data.purchase.subscription_id)
        return charges
    }

    async isValid(invalidCases?: InvalidCases) {
        if (invalidCases) {
            if ((await this.getCharges()).remaining_charges_count > 0) throw new InvalidLicenseError(INVALID_LICENSE_REASONS.OUTSTANDING_PAYMENTS)
        }
        if (this.data.purchase.subscription_cancelled_at) throw new InvalidLicenseError(INVALID_LICENSE_REASONS.CANCELLED_LICENSE)
        if (this.data.purchase.subscription_ended_at) throw new InvalidLicenseError(INVALID_LICENSE_REASONS.EXPIRED_LICENSE)
        return true
    }
}

export class GumroadClient {

    private product_id?: string;
    private apiUrl: string = "https://gumroad.com/api/v2/";
    #access_token = "";

    constructor(access_token: string, product_id?: string) {
        this.product_id = product_id;
        this.#access_token = access_token;
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
                ...(method==="GET" && _data || {})
            },
            data: _data,
            headers
        });
        if (data?.success && status === 200) return data
        throw new Error(`Gumroad API returned ${status}, ${data?.success}`);
    }

    public async getLicense(license_key: string, product_id: string): Promise<GumroadLicense> {
        if (!product_id && !this.product_id) throw new Error("No product ID provided");
        const url = `licenses/verify`
        const product_permalink = product_id || this.product_id;
        const licData = (await this.req('POST', url, {
            product_permalink,
            license_key
        })) as GumroadLicenseResponseInterface;
        return new GumroadLicense(licData, this)
    }

    public async getSubscriptionCharges(subscription_id: string): Promise<GumroadSubscriptionChargesResponseInterface> {
        const charges = await this.req('GET', `customers/subscription_recurring_purchases/${subscription_id}`) as GumroadSubscriptionChargesResponseInterface
        return charges
    }

    /**
     * Grab the licenses of the 
     */
    public async getSubscriptions(product_id: string, email ?: string) : Promise<GumroadApiResponseWrapperInterface & {
        subscribers: Subscription[]
    }> {
        const subscriptions = await this.req('GET', `products/${product_id}/subscribers`, {
            email
        }) as GumroadApiResponseWrapperInterface & {
            subscribers: Subscription[]
        }
        return subscriptions
    }

    /**
     * Check if the email address provided in the second param is a subscriber of the given product id.
     * @param product_id the gumroad product id (e.g BTMt)
     * @param email the email to check
     * @returns boolean
     */
    public async emailIsSubscriber(product_id: string, email : string) : Promise<boolean> {
        const subscriptions = await this.getSubscriptions(product_id,email);
        if(subscriptions.subscribers.length) return true;
        return false;
    }

}