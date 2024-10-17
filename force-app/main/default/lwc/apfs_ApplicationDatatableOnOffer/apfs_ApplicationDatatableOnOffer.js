import { LightningElement, api, wire, track } from 'lwc';
import getApplicationsByOffer from '@salesforce/apex/APFS_OfferApplications.getApplicationsByOffer';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Apfs_ApplicationDatatableOnOffer extends LightningElement {

    @api recordId; 
    @track applications = []; 
    columns = [
        { 
            label: 'Application Id', 
            fieldName: 'recordUrl', 
            type: 'url', 
            typeAttributes: { 
                label: { fieldName: 'Name' }, 
                target: '_self' 
            } 
        },
        { label: 'Contact', fieldName: 'Contact__c'}, 
        { label: 'Scholarship Round', fieldName: 'Scholarship_Round__c'}, 
        { label: 'Application Status', fieldName: 'Application_Internal_Status__c'}
    ];

    @wire(getApplicationsByOffer, { offerId: '$recordId' })
    wiredOffer({ data, error }) {
        if (data) {            
            this.applications = [{
                Id: data.Id,
                recordUrl: `/lightning/r/Application__c/${data.Application__r.Id}/view`, 
                Name: data.Application__r ? data.Application__r.Name : 'N/A',
                Contact__c: data.Application__r.Contact__r ? data.Application__r.Contact__r.Name : 'N/A',
                Scholarship_Round__c: data.Application__r.Scholarship_Round__r ? data.Application__r.Scholarship_Round__r.Name : 'N/A',
                Application_Internal_Status__c: data.Application__r.Application_Internal_Status__c || 'N/A'
            }];
        } else if (error) {
            this.showToast('Error', error.body.message || 'Failed to load offer details', 'error');
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
}