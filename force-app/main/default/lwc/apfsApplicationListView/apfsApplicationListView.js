import { LightningElement, wire } from 'lwc';
import getApplicationRecords from '@salesforce/apex/APFS_GetSelectedApplications.getApplicationRecords';

const columns = [
    { label: 'ID', fieldName: 'Id' },
    { label: 'Name', fieldName: 'Name' },
    { label: 'Applicant Name', fieldName: 'Contact__c' },
    { label: 'Application External Status', fieldName: 'Application_External_Status__c' },
    { label: 'Application Internal Status', fieldName: 'Application_Internal_Status__c' }
];

export default class ApfsApplicationListView extends LightningElement {
    columns = columns;
    applicationRecords = [];

    @wire(getApplicationRecords)
    wiredCustomObjects({ error, data }) {
        if (data) {
            this.applicationRecords = data;
        } else if (error) {
            console.error('Error:', error);
        }
    }
}