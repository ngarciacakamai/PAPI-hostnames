# PAPI-hostnames
How to add hostnames to a property one by one or in bulk

Akamai PAPI Hostname Bulk Adder (Node.js)

This script uses the Akamai EdgeGrid Node.js module to **bulk add hostnames** to an existing Akamai Property using the **Property Manager API (PAPI)**.

It is designed to be simple, direct, and easy to modify for quick automation tasks.

---

Features

- Bulk add multiple hostnames in a **single API call**
- Uses **EdgeGrid authentication (.edgerc)**
- Targets **STAGING network by default (safe testing)**
- Simple logging (`response`, `body`, `error`)
- Supports **CPS-managed certificates**

---

## 📋 Prerequisites

- Node.js (v14+ recommended)
- Akamai API credentials configured in `~/.edgerc`
- Access to:
  - Property Manager API (PAPI)
  - Contract ID
  - Group ID
  - Property ID
  - Edge Hostname IDs

Install dependency:
npm install akamai-edgegrid

.edgerc Configuration

Make sure your ~/.edgerc file is properly configured:
[default]
client_token = your_client_token
client_secret = your_client_secret
access_token = your_access_token
host = your_akamai_host

Update these values in the script:
const accountSwitchKey = 'xxxxx'
const contractId = "ctr_1234-xxxx"
const groupId = "grp_1234"
const propertyID = 'prp_1234'

Update your .edgerc path if needed:
path: '/Users/yourldap/.edgerc'

How it works:
The script sends a PATCH request to: /papi/v1/properties/{propertyId}/hostnames

Including:
contractId
groupId
accountSwitchKey

Example Payload:
{
  "network": "STAGING",
  "note": "Adding a bunch of HNs",
  "add": [
    {
      "cnameFrom": "example1.com",
      "cnameType": "EDGE_HOSTNAME",
      "edgeHostnameId": "ehn_27287",
      "certProvisioningType": "CPS_MANAGED"
    },
    {
      "cnameFrom": "www.example.com",
      "cnameType": "EDGE_HOSTNAME",
      "edgeHostnameId": "ehn_272876",
      "certProvisioningType": "CPS_MANAGED"
    }
  ]
}

Run the script:

node script.js

📚 References
Akamai Property Manager API (PAPI): https://techdocs.akamai.com/property-mgr/reference/api
EdgeGrid Authentication Guide: https://techdocs.akamai.com/developer/docs/authenticate-with-edgegrid
