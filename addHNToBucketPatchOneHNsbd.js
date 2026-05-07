
const EdgeGrid = require('akamai-edgegrid');
const accountSwitchKey = 'xxxx'  //switchkey account 

const contractId = "xxxx" //contract ID 
const groupId = "grp_9876"  //groupID
const propertyID='prp_4567'   //property id destination


const eg = new EdgeGrid({
  path: '/Users/nathan/.edgerc', //update you own path for .edgerc
  section: 'default' //update you own .edgerc section
});

eg.auth({
  path: `/papi/v1/properties/${propertyID}/hostnames?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
  method: 'PATCH',
  headers: {Accept: 'application/json', 'PAPI-Use-Prefixes': 'true', 'content-type':'application/json'},

  body: JSON.stringify({
    network: 'STAGING', //important to point it to STG only.
    add: [
      {
        cnameFrom: 'example.com',   // Hostname
        cnameType: 'EDGE_HOSTNAME',       // cnameType
        edgeHostnameId: 'ehn_1234',  //edge hostname ID
        certProvisioningType: 'CPS_MANAGED' ///CPS_MANAGED or DEFAULT (sbd)
      }
    ]
  })
});

eg.send(function(error, response, body) {
  console.log(response);
  console.log(body);
  console.log(error);
});
