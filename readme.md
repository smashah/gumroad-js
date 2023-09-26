Gumroad API Client

This is a TypeScript client for interacting with the Gumroad API. It provides a simple and intuitive way to interact with the API, with support for all the major endpoints. It includes interfaces for the various data types returned by the API, as well as classes for managing licenses and subscriptions.
Table of Contents

- Installation
- Usage
- API
- GumroadClient
- GumroadLicense
- Inputs
- Methods
- Examples
Installation

To install the library, use the following command:
client
Usage

First, import the GumroadClient class from the library:
;

Then, create a new instance of the client, passing your Gumroad API access token, product id, and cookie as parameters to the constructor:
;

You can now use the client to interact with the Gumroad API. For example, to get a license:
;
API
GumroadClient

The main class for interacting with the Gumroad API. It provides methods for making requests to the API, managing resource subscriptions, and working with licenses and subscriptions.
GumroadLicense

A class for managing a Gumroad license. It provides methods for getting charges, purchases, and subscription information, as well as checking the validity and status of the license.
Inputs

The GumroadClient and GumroadLicense classes require several inputs to function correctly. These include your Gumroad API access token, product id, and cookie for the GumroadClient, and a Purchase object and GumroadClient instance for the GumroadLicense.
Methods

Most methods in the GumroadClient and GumroadLicense classes also require inputs. For example, the GumroadClient.getLicense method requires a license key and product id, and the GumroadLicense.isValid method optionally takes an InvalidCases object.
Examples

Here's an example of how to use the GumroadClient to get a license:
;

And here's an example of how to use the GumroadLicense to check if a license is valid:
;

Please refer to the API documentation above for more details on how to use each method.