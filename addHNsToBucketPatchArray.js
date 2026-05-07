const EdgeGrid = require('akamai-edgegrid');
const accountSwitchKey = 'xxxxx'  //account swkey

const contractId = "ctr_3-xxxx" //account contract
const groupId = "grp_1234" //groupID
const propertyID='prp_4567'   //destination propertyID 

const eg = new EdgeGrid({
  path: '/Users/nathan/.edgerc', //update with your own path 
  section: 'default' //update with your own credetials section as per your .edgerc
});

eg.auth({
  path: `/papi/v1/properties/${propertyID}/hostnames?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
  method: 'PATCH',
  headers: {Accept: 'application/json', 'PAPI-Use-Prefixes': 'true', 'content-type':'application/json'},

  body: JSON.stringify({
    network: 'STAGING', ///SUPER IMPORTANT to make changes only in STG.
    note: 'Adding a bunch of HNs', //if the property you are adding the HNS to is a hostaname bucket, it supports up to 1k hostnames in one single call.
    add: [
      {
        cnameFrom: 'example1.com',
        cnameType: 'EDGE_HOSTNAME',
        edgeHostnameId: 'ehn_27287',
        certProvisioningType: 'CPS_MANAGED',
      },
      {
        cnameFrom: 'www.example.com',
        cnameType: 'EDGE_HOSTNAME',
        edgeHostnameId: 'ehn_272876',
        certProvisioningType: 'CPS_MANAGED',
      },
      {
        cnameFrom: 'www.example2.com',
        cnameType: 'EDGE_HOSTNAME',
        edgeHostnameId: 'ehn_272873',
        certProvisioningType: 'CPS_MANAGED',
      },
      {
        cnameFrom: 'www.something.com',
        cnameType: 'EDGE_HOSTNAME',
        edgeHostnameId: 'ehn_212350',
        certProvisioningType: 'CPS_MANAGED',
      }
    ]
  })
});

eg.send(function(error, response, body) {
  console.log(response);
  console.log(body);
  console.log(error);
});
