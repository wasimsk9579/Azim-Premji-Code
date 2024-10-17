import { LightningElement,track,wire} from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
const CONTACT_FIELDS =['Contact.Is_Profile_Complete__c'];
export default class ApfsCoProfileComplete extends NavigationMixin( LightningElement) {
    @track userContactId;
    @track contactRecord;

    @wire(getRecord, { recordId: USER_ID, fields: CONTACT_ID_FIELD })
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
            console.log('Contact Id found Successfully',this.userContactId);
 
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }

    // Retrieve the Contact record based on the ContactId retrieved from the User record
    @wire(getRecord, { recordId: '$userContactId', fields: CONTACT_FIELDS })
    wiredContactRecord({ error, data }) {
        if (data) {
            this.contactRecord = data;
            console.log('Contact Record',JSON.stringify(this.contactRecord))
           
        } else if (error) {
            this.showErrorToast(error.body.message);
            console.log('Error');
 
        }
    }
    get isprofilecomplete(){
        return getFieldValue(this.contactRecord, 'Contact.Is_Profile_Complete__c')===false;
        
    }

    
    

    handleProceed(){
        this.navigateToMyProfile();
        console.log(this.isprofilecomplete);
        
    }
    navigateToMyProfile() {

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'My_Profile__c'
          }
        });
    }
}