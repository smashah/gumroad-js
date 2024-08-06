# Gumroad API Client

A TypeScript/JavaScript client for interacting with the Gumroad API. This library provides a simple and intuitive way to interact with the Gumroad API, supporting all major endpoints. It includes interfaces for various data types returned by the API, as well as classes for managing licenses and subscriptions.

## Installation

To install the library, use the following command:

```sh
> npm install smashroad
```


## Usage

First, import the `GumroadClient` class from the library:

```javascript
import { GumroadClient } from 'smashroad';
```

Then, create a new instance of the client, passing your Gumroad API access token, product id, and cookie as parameters to the constructor:

```javascript
const client = new GumroadClient('YOUR_ACCESS_TOKEN', 'YOUR_PRODUCT_ID', 'YOUR_GUMROAD_COOKIE');
```

You can now use the client to interact with the Gumroad API. For example, to get a license:

```javascript
const license = await client.getLicense('LICENSE_KEY', 'PRODUCT_ID');
```

## API

### GumroadClient

The main class for interacting with the Gumroad API. It provides methods for making requests to the API, managing resource subscriptions, and working with licenses and subscriptions.

#### Constructor

```javascript
new GumroadClient(access_token: string, product_id?: string, cookie?: string)
```

- `access_token`: Gumroad API access token
- `product_id`: (Optional) Gumroad product id
- `cookie`: (Optional) Gumroad cookie. You can get this from the browser when you're logged in to Gumroad.

#### Methods

```javascript
public async getResourceSubscriptions(resource_name : ResourceSubscriptionType) : Promise<ResourceSubscription[]>
```

```javascript
public async createResourceSubscription(resource_name: ResourceSubscriptionType, post_url: string) : Promise<ResourceSubscription>
```

```javascript
public async getLicense(license_key: string, product_id: string): Promise<GumroadLicense>
```

```javascript
public async getSubscriptionPurchases(subscription_id: string): Promise<Purchase[]>
```javascript
public async searchPurchases(query: string): Promise<Purchase[]>
```

```javascript
public async getSubscriptions(email?: string, product_id?: string): Promise<Subscription[]>

```

```javascript
public async emailIsSubscriber(email: string, product_id ?: string): Promise<boolean>
```

```javascript
public async getSubscription(subscription_id: string): Promise<Subscription>

```


### GumroadLicense

A class for managing a Gumroad license. It provides methods for getting charges, purchases, and subscription information, as well as checking the validity and status of the license.

#### Constructor

```javascript
new GumroadLicense(initiatingPurchase: Purchase, client: GumroadClient)
```


#### Methods
```javascript
async getCharges(): Promise<Purchase[]>
```

```javascript
async getPurchases(): Promise<Purchase[]>

```

```javascript
async getSubscription(): Promise<Subscription>

```

```javascript
async isValid(invalidCases?: InvalidCases): Promise<boolean>

```

```javascript
async getStatus(): Promise<string>

```

```javascript
async getTotalRevenue(): Promise<number>
```

## Examples

Here's an example of how to use the GumroadClient to get a license:

```javascript
const client = new GumroadClient('YOUR_ACCESS_TOKEN', 'YOUR_PRODUCT_ID', 'YOUR_GUMROAD_COOKIE');
const license = await client.getLicense('LICENSE_KEY', 'PRODUCT_ID');
console.log(await license.getStatus());
```

And here's an example of how to use the GumroadLicense to check if a license is valid:


```javascript
const client = new GumroadClient('YOUR_ACCESS_TOKEN', 'YOUR_PRODUCT_ID', 'YOUR_GUMROAD_COOKIE');
const license = await client.getLicense('LICENSE_KEY', 'PRODUCT_ID');
try {
const isValid = await license.isValid();
console.log('License is valid');
} catch (error) {
console.error('License is invalid:', error.message);
}

```


## Types

The library includes TypeScript definitions for various Gumroad API response types, including:

- `Purchase`
- `Subscription`
- `ResourceSubscription`
- `GumroadSaleData`
- `GumroadSubscriptionData`
- `SubscriptionUpdateData`
- `SubscriptionEndedData`
- `SubscriptionRestartedData`

These types can be imported and used in your TypeScript projects for better type checking and autocompletion.

## Error Handling

The library throws errors for invalid API responses or when a license is invalid. Make sure to wrap your API calls in try-catch blocks to handle these errors gracefully.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.