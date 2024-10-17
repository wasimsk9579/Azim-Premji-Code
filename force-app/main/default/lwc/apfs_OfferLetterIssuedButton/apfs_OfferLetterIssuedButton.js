import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const FIELDS =[
    'Offer__c.Application__c',
    'Offer__c.Application__r.Application_External_Status__c',
    'Offer__c.Application__r.Application_Internal_Status__c'
];


export default class Apfs_OfferLetterIssuedButton extends NavigationMixin(LightningElement) {
    @api recordId;
    applicationId;
    applicationInternalStatus;
    applicationExternalStatus;
    applicationInternalStatusUpdate ='Offer Letter Issued';
    applicationExternalStatusUpdate ='Offer Letter Issued';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredOffer(result) {
        if(result.data){
            this.applicationId = result.data?.fields?.Application__c?.value;
            this.applicationInternalStatus = result.data?.fields?.Application__r?.value?.fields?.Application_Internal_Status__c	?.value;
            this.applicationExternalStatus = result.data?.fields?.Application__r?.value?.fields?.Application_External_Status__c	?.value;
        }else if (result.error) {
            this.showToast('Error', error.body.message || 'Failed to fetch offerDetails', 'error');
        }
    }

    handleClickButton(){
        const fields = {
            Id: this.applicationId,
            Application_External_Status__c: this.applicationExternalStatusUpdate,
            Application_Internal_Status__c: this.applicationInternalStatusUpdate
        };
        this.updateApplicationStatus(fields);
    }
    updateApplicationStatus(fields) {
        const recordInput = { fields };
        try {
            updateRecord(recordInput);
            this.showToast('Success', 'Application status updated successfully', 'success');
            this.navigateToOfferPage();

        } catch (error) {
            this.showToast('Error', error.body.message ? error.body.message : 'Failed to update Application status', 'error');
        }
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