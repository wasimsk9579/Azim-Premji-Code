import { LightningElement, track, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class ApfsCoPaginationTable extends LightningElement {

    @track recordTypeId;
    @track columns = [
        { label: 'Account Name', fieldName: 'Name' },
        { label: 'Account Number', fieldName: 'AccountNumber' },
        { label: 'Phone Number', fieldName: 'Phone' },
        { label: 'Account Type', fieldName: 'Type' },
        { label: 'Account Rating', fieldName: 'Rating',  }
    ];

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInternalInfo({ error, data }) {
        if (data) {
            this.recordTypeId =data.defaultRecordTypeId;
            console.log('data--->',data);
            console.log('recordTypeId--->',this.recordTypeId);
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message: 'Failed to fetch Application record type', 'error');
        }
    }

    
}