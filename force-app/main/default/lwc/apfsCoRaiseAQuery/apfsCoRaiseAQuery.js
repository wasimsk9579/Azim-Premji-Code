/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-06-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement ,wire} from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import QUERY_OBJECT from '@salesforce/schema/Query__c';
// import QUERY_TOPIC_FIELD from '@salesforce/schema/Query__c.Query_Topic__c';
// import QUERY_SUB_TOPIC_FIELD from '@salesforce/schema/Query__c.Query_Sub_Topic__c';
// import USER_ID from '@salesforce/user/Id';
// import CONTACT_FIELD from '@salesforce/schema/User.ContactId';

export default class ApfsCoRaiseAQuery extends LightningElement {


    //  queryTopic;
    //  querySubTopic;
    // queryTopicOptions = [];
    // querySubTopicOptions = [];
    // allSubTopicOptions = [];
    // isSubTopicDisabled=true;
    // contactId;
    // showOtherTopic = false;
    // showOtherSubTopic = false;

    

    // @wire(getObjectInfo, { objectApiName: QUERY_OBJECT })
    // queryObjectInfo;

    // @wire(getPicklistValues, { recordTypeId: '$queryObjectInfo.data.defaultRecordTypeId', fieldApiName: QUERY_TOPIC_FIELD })
    // wiredQueryTopicPicklistValues({ error, data }) {
    //     if (data) {
    //         this.queryTopicOptions = data.values;
    //     } else if (error) {
    //         console.error('Error loading query topic picklist values', error);
    //     }
    // }

    // @wire(getPicklistValues, { recordTypeId: '$queryObjectInfo.data.defaultRecordTypeId', fieldApiName: QUERY_SUB_TOPIC_FIELD })
    // wiredQuerySubTopicPicklistValues({ error, data }) {
    //     if (data) {
    //         this.allSubTopicOptions = data;
    //     } else if (error) {
    //         console.error('Error loading query sub-topic picklist values', error);
    //     }
    // }
    // @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_FIELD] })
    // wiredUser({ error, data }) {
    //     if (data) {
    //         this.contactId = data.fields.ContactId.value;
    //         console.log('Contact ID',this.contactId);
    //     } else if (error) {
    //         console.error('Error loading user data', error);
    //     }
    // }

    // handleTopicChange(event) {
    //     this.queryTopic = event.detail.value;
    //     this.querySubTopic=null;
    //     this.showOtherSubTopic=false;
    //     this.querySubTopicOptions = this.allSubTopicOptions.values.filter(option => 
    //         option.validFor.includes(this.allSubTopicOptions.controllerValues[this.queryTopic]));

    //         this.isSubTopicDisabled = !this.queryTopic;
    //         this.showOtherTopic = this.queryTopic === 'Other';
          
    // }

    // handleSubTopicChange(event) {
    //     this.querySubTopic = event.detail.value;
    //     this.showOtherSubTopic = this.querySubTopic === 'Other'; 
    // }


    // handleSubmit(event) {

    //     event.preventDefault();
        
    //         const fields = event.detail.fields;
    //         fields.Contact__c = this.contactId;
    //         fields.Query_Topic__c = this.queryTopic;
    //         fields.Query_Sub_Topic__c = this.querySubTopic;
            
    //         this.template.querySelector('lightning-record-edit-form').submit(fields);
       
    // }
 
    // handleSuccess(event) {
    //     this.showToast('Success', 'Query raised successfully', 'success');
    //     this.clearFields();
    // }

    // handleError(event) {
    //     const incompleteFields = [...this.template.querySelectorAll('lightning-combobox, lightning-input-field')]
    //         .filter(inputCmp => inputCmp.required && !inputCmp.value)
    //         .map(inputCmp => inputCmp.label);
        
    //     if (incompleteFields.length > 0) {
    //         this.showToast('Error', `Please select the following fields: ${incompleteFields.join(', ')}`, 'error');
    //     } else {
    //         this.showToast('Error', 'Something went wrong', 'error');
    //     }
    // }
 
    // clearFields() {
    //     this.queryTopic = null;
    //     this.querySubTopic = null;
        
    //     this.isSubTopicDisabled = true;
    //     this.showOtherTopic = false;
    //     this.showOtherSubTopic = false;
    //     const inputFields = this.template.querySelectorAll('lightning-input-field, lightning-combobox');
    //     if (inputFields) {
    //         inputFields.forEach(field => {
    //             field.value = '';
                

    //         });
    //     }
    // }



    // showToast(title, message, variant) {
    //     const toastEvent = new ShowToastEvent({
    //         title: title,
    //         message: message,
    //         variant: variant,
    //     });
    //     this.dispatchEvent(toastEvent);
    // }

}