import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/uiGraphQLApi';

export default class ApfsCoStateDistrictBlockDetails extends LightningElement {
    accountData;
  @wire(graphql, {
    query: gql`
      query AccountInfo {
        uiapi {
          query {
            Account(where: { Name: { like: "India" } }) {
              edges {
                node {
                  Name {
                    value
                    displayValue
                  }
                }
              }
            }
          }
        }
      }
    `
  })
  propertyOrFunction;


   // Wire decorator to fetch data using the GraphQL query
   @wire(graphql, { query: '$accountQuery' })
   wiredAccountData({ error, data }) {
       if (data) {
           this.accountData = data.uiapi.query.Account.edges;
           console.log('accountData ---->', this.accountData)
           this.error = undefined;
       } else if (error) {
           this.error = error;
           this.accountData = undefined;
       }
   }
}