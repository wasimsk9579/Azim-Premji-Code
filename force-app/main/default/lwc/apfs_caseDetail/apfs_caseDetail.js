import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const CASE_FIELDS = [
    'Case.APFS_Raise_A_Query_Topic__c',
    'Case.APFS_Raise_A_Query_Sub_Topic__c',
    'Case.Subject',
    'Case.Status',
    'Case.Description',
    'Case.Priority',
    'Case.ContactId',
    'Case.Origin',
    'Case.CaseNumber',
    'Case.Application__r.Name',
    'Case.Comments__c' // Added the Comments__c field
];

export default class Apfs_caseDetail extends LightningElement {
    @api recordId;
    @track caseRecord;
    @track isLoading = true;

    @wire(getRecord, { recordId: '$recordId', fields: CASE_FIELDS })
    wiredCaseData({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.caseRecord = data;
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }

    get caseNumber() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.CaseNumber') : 'N/A';
    }

    get subject() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.Subject') : 'N/A';
    }

    get status() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.Status') : 'N/A';
    }

    get raiseAQueryTopic() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.APFS_Raise_A_Query_Topic__c') : 'N/A';
    }

    get raiseASubQueryTopic() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.APFS_Raise_A_Query_Sub_Topic__c') : 'N/A';
    }

    get description() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.Description') : 'N/A';
    }
    get application() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.Application__r.Name') : 'N/A';
    }
    // Added getter method for Comments__c field
    get comments() {
        return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.Comments__c') : 'N/A';
    }

    // get comments() {
    //     return this.caseRecord ? getFieldValue(this.caseRecord, 'Case.Comments__c') : 'N/A';
    // }
  
    // Error Notification
    showErrorToast(errorMessage) {
        const event = new ShowToastEvent({
            title: 'Error',
            message: errorMessage,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}