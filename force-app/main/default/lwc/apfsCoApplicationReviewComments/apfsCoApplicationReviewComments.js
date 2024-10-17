import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import APPLICATION_INTERNAL_STATUS_FIELD from '@salesforce/schema/Application__c.Application_Internal_Status__c';
import APPLICATION_REVIEW_COMMENT_FIELD from '@salesforce/schema/Application__c.Application_Review_Comment__c';
import CREATED_DATE_FIELD from '@salesforce/schema/Application__c.CreatedDate';

const FIELDS = [
    APPLICATION_INTERNAL_STATUS_FIELD,
    APPLICATION_REVIEW_COMMENT_FIELD,
    CREATED_DATE_FIELD
];

export default class ApfsCoApplicationReviewComments extends LightningElement {
    @api recordId; 
    @track applicationData;

    columns = [
        { label: 'Status', fieldName: 'Application_Internal_Status__c', type: 'text' },
        { label: 'Date', fieldName: 'CreatedDate', type: 'date', 
          typeAttributes: {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          }
        },
        { label: 'Comment', fieldName: 'Application_Review_Comment__c', type: 'text' }
    ];

    connectedCallback() {
        console.log('record id----:' + this.recordId);
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredApplication({ error, data }) {
        if (data) {
            console.log('Data---', data);
            this.applicationData = [
                {
                    Id: this.recordId,
                    Application_Internal_Status__c: data.fields.Application_Internal_Status__c.value,
                    Application_Review_Comment__c: data.fields.Application_Review_Comment__c.value,
                    CreatedDate: data.fields.CreatedDate.value
                }
            ];
        } else if (error) {
            console.error('Error fetching application record:', error);
        }
    }
}