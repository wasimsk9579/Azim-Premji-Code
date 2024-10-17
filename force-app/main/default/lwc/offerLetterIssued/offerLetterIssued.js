import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const FIELDS =[
    'Offer__c.Application__c',
    'Offer__c.Application__r.Application_Internal_Status__c'
];

export default class OfferLetterIssued extends LightningElement {
    @api recordId;
    applicationId;
    applicationInternalStatus;
    applicationInternalStatusUpdate ='Offer Letter Issued';

    connectedCallback() {
        console.log('Current offer record-'+this.recordId);
    }
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredOffer(result) {
        if(result.data){
            console.log('Offer fields--'+JSON.stringify(result.data));
            this.applicationId = result.data?.fields?.Application__c?.value;
            this.applicationInternalStatus = result.data?.fields?.Application__r?.value?.fields?.Application_Internal_Status__c	?.value;
        }else if (result.error) {
            this.showToast('Error', error.body.message || 'Failed to fetch offerDetails', 'error');
        }
    }

    handleClickButton(){
        const fields = {
            Id: this.applicationId,
            Application_Internal_Status__c: this.applicationInternalStatusUpdate
        };
        this.updateRecord(fields);
    }
    updateRecord(fields) {
        const recordInput = { fields };
        return updateRecord(recordInput)
            .then(() => {
                this.showToast('Success', 'Application status updated successfully', 'success');
            })
            .catch(error => {
                console.log('update error-'+error.body.message);
                this.showToast('Error',error.body.message?error.body.message: 'Failed to update Application status', 'error');
            });
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
    navigateToOfferPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Offer_Lightning'             
            }
        });
    }
}