/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-28-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement,wire } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord, getFieldValue,createRecord } from 'lightning/uiRecordApi';
import { getListUi } from 'lightning/uiListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import CONTACT_FIELD from '@salesforce/schema/User.ContactId';
import CASE_OBJECT from '@salesforce/schema/Case';
import CASE_TOPIC_FIELD from '@salesforce/schema/Case.APFS_Raise_A_Query_Topic__c';
import CASE_SUB_TOPIC_FIELD from '@salesforce/schema/Case.APFS_Raise_A_Query_Sub_Topic__c';
import CASE_EXAMPLE_FIELD from '@salesforce/schema/Case.Example__c';
import APPLICATION_OBJECT from '@salesforce/schema/Application__c';
import APPLICATION_NAME_FIELD from '@salesforce/schema/Application__c.Name';

import TOPIC_LABEL from '@salesforce/label/c.Topic_Label';
import SUB_TOPIC_LABEL from '@salesforce/label/c.Sub_Topic_Label';
import SUBJECT_LABEL from '@salesforce/label/c.Subject_Label';
import DESCRIPTION_LABEL from '@salesforce/label/c.Description_Label';
import APPLICATION_LABEL from '@salesforce/label/c.Application_Label';
import topicIsRequiredLabel from '@salesforce/label/c.Topic_is_required_Label';
import subTopicIsRequiredLabel from '@salesforce/label/c.Sub_Topic_is_required_Label';
import subjectIsRequiredLabel from '@salesforce/label/c.Subject_is_required_Label';
import descriptionIsRequiredLabel from '@salesforce/label/c.Description_is_required_Label';
import COMPLETE_THIS_FIELD_LABEL from '@salesforce/label/c.Complete_this_field_Label';   
import NEW_QUERY_LABEL from '@salesforce/label/c.New_Query_Label'; 
import sucessLabel from '@salesforce/label/c.Success_Label';  
import QUERY_SUCCESS_TOAST_MESSAGE from '@salesforce/label/c.Your_query_has_been_raised_Successfully_Label'; 
import SELECT_TOPIC_LABEL from '@salesforce/label/c.Select_Topic_Label';
import SELECT_SUB_TOPIC_LABEL from '@salesforce/label/c.Select_Sub_Topic_Label';
import ENTER_SUBJECT_LABEL from '@salesforce/label/c.Enter_Subject_Label';
import ENTER_DESCRIPTION_LABEL from '@salesforce/label/c.Enter_Description_Label';
import SELECT_APPLICATION_LABEL from '@salesforce/label/c.Select_Application_Label';  
import ERROR_LABEL from '@salesforce/label/c.Error_Label';  

export default class ApfsCoCreateCase extends LightningElement {

    contactId;
    isModalOpen = false;

   

    caseTopicOptions = [];
    caseSubTopicOptions = [];
    caseExampleOptions=[];
    applicationOptions = [];

    selectedCaseTopic;
    selectedCaseSubTopic;
    selectedCaseSubject;
    selectedCaseDescription;
    selectedApplication;

    allCaseSubTopicOptions;
    allCaseExampleOptions;

    isSubTopicDisabled = true;
    isLoading;
    isSaving;
 
    newQueryLabel = NEW_QUERY_LABEL;
    topicLabel = TOPIC_LABEL;
    subTopicLabel = SUB_TOPIC_LABEL;
    subjectLabel = SUBJECT_LABEL;
    descriptionLabel = DESCRIPTION_LABEL;
    applicationLabel = APPLICATION_LABEL;
    requiredFieldError = COMPLETE_THIS_FIELD_LABEL;
    selectTopicLabel = SELECT_TOPIC_LABEL;
    selectSubTopicLabel = SELECT_SUB_TOPIC_LABEL;
    enterSubjectLabel = ENTER_SUBJECT_LABEL;
    enterDescriptionLabel = ENTER_DESCRIPTION_LABEL;
    selectApplicationLabel = SELECT_APPLICATION_LABEL;

@wire(getObjectInfo, { objectApiName: CASE_OBJECT })
caseObjectInfo;

@wire(getPicklistValues, { recordTypeId: '$caseObjectInfo.data.defaultRecordTypeId', fieldApiName: CASE_TOPIC_FIELD })
wiredCaseTopicPicklistValues({ error, data }) {
    if (data) {
        this.caseTopicOptions = data.values;
    } else if (error) {
        this.showToast('Error', error.body.message ? error.body.message : 'Failed to fetch topic options', 'error');
    }
}

@wire(getPicklistValues, { recordTypeId: '$caseObjectInfo.data.defaultRecordTypeId', fieldApiName: CASE_SUB_TOPIC_FIELD })
wiredCaseSubTopicPicklistValues({ error, data }) {
    if (data) {
        this.allCaseSubTopicOptions = data; 
        this.filterSubTopicOptions(); // Filter sub-topic options based on selected topic
    } else if (error) {
        this.showToast('Error', error.body.message ? error.body.message : 'Failed to fetch sub-topic options', 'error');
    }
}

@wire(getPicklistValues, { recordTypeId: '$caseObjectInfo.data.defaultRecordTypeId', fieldApiName: CASE_EXAMPLE_FIELD })
wiredCaseExamplePicklistValues({ error, data }) {
    if (data) {
        this.allCaseExampleOptions = data;
        this.filterExampleOptions(); // Filter example options based on selected sub-topic
    } else if (error) {
        this.showToast('Error', error.body.message ? error.body.message : 'Failed to fetch example options', 'error');
    }
}

get hasExampleOptions() {
    return this.caseExampleOptions && this.caseExampleOptions.length > 0;
}

@wire(getRecord, { recordId: USER_ID, fields: [CONTACT_FIELD] })
wiredUser({ error, data }) {
    if (data) {
        this.contactId = data.fields.ContactId.value;
    } else if (error) {
        this.showToast('Error', error.body.message ? error.body.message : 'Failed to fetch current user details', 'error');
    }
}


@wire(getListUi, { objectApiName: APPLICATION_OBJECT, listViewApiName: 'All' })
wiredApplications({ error, data }) {
    if (data) {
        this.applicationOptions = data.records.records.map(record => {
            return {
                label: getFieldValue(record, APPLICATION_NAME_FIELD),
                value: record.id
            };
        });
    } else if (error) {
        this.showToast('Error', error.body.message ? error.body.message : 'Failed to fetch applications', 'error');
    }
}

// Open Modal
handleOpenModal() {
    this.isModalOpen = true;
}

// Close Modal
handleCloseModal() {
    this.isModalOpen = false;
    this.clearFields();
}

// Clear Fields After Saving or Cancelling
clearFields() {
        this.selectedCaseTopic = null;
        this.selectedCaseSubTopic = null;
        this.selectedCaseSubject = null;
        this.selectedCaseDescription = null;
        this.selectedApplication = null;
        this.caseSubTopicOptions = [];
        this.caseExampleOptions = [];
        this.isSubTopicDisabled = true;
}

// Handle Topic Change
handleTopicChange(event) {
    this.selectedCaseTopic = event.detail.value;
    this.selectedCaseSubTopic = '';
    this.caseSubTopicOptions = [];
    this.isSubTopicDisabled = !this.selectedCaseTopic;
    this.caseExampleOptions = []; 
    this.filterSubTopicOptions();
   
}



// Handle Sub Topic Change
handleSubTopicChange(event) {
    this.selectedCaseSubTopic = event.detail.value;
    console.log('this.selectedCaseSubTopic',this.selectedCaseSubTopic);
    this.filterExampleOptions();
}

filterSubTopicOptions() {
    if (this.allCaseSubTopicOptions && this.selectedCaseTopic) {
        const controllerValueIndex = this.allCaseSubTopicOptions.controllerValues[this.selectedCaseTopic];
        this.caseSubTopicOptions = this.allCaseSubTopicOptions.values.filter(option =>
            option.validFor.includes(controllerValueIndex)
        );
    } else {
        this.caseSubTopicOptions = [];
    } 
}

filterExampleOptions() {
    if (this.allCaseExampleOptions && this.selectedCaseSubTopic) {
        const controllerValueIndex = this.allCaseExampleOptions.controllerValues[this.selectedCaseSubTopic];
        this.caseExampleOptions = this.allCaseExampleOptions.values.filter(option =>
            option.validFor.includes(controllerValueIndex)
        );
    } else {
        this.caseExampleOptions = [];
    }
}

 // Handle Application Change
 handleApplicationChange(event) {
    this.selectedApplication = event.detail.value;
    console.log(this.selectedApplication);
  
}
handleBeForChangeSubject(event) {
    const pattern = /^[a-zA-Z0-9\s,.\-_()/]*$/;

    const inputChar = event.data || '';
    if (!pattern.test(inputChar)) {
        event.preventDefault();
    }
}
// Handle Subject Change
handleSubjectChange(event) {
    this.selectedCaseSubject = event.target.value.replace(/\s+/g,' ').trim();
}
handleBeForChangeDescription(event) {
    const pattern = /^[\w\s\-.,!@#$%^&*()_+={}[\]:;"'<>,?/~|\\]*$/;
    const inputChar = event.data || '';
    if (!pattern.test(inputChar)) {
        event.preventDefault();
    }
}
handleDescriptionChange(event) {
    this.selectedCaseDescription = event.target.value.replace(/\s+/g,' ').trim();
}
handleSave() {
    if (this.isSaving) {
        return; 
    }

    this.isSaving = true; 

    if (!this.selectedCaseTopic) {
        this.showToast(ERROR_LABEL, topicIsRequiredLabel, 'error');
        this.resetSavingState();
        return;
    }
    if (!this.selectedCaseSubTopic) {
        this.showToast(ERROR_LABEL,subTopicIsRequiredLabel, 'error');
        this.resetSavingState();
        return;
    }
    if (!this.selectedCaseSubject) {
        this.showToast(ERROR_LABEL, subjectIsRequiredLabel, 'error');
        this.resetSavingState();
        return;
    }
    if (!this.selectedCaseDescription) {
        this.showToast(ERROR_LABEL,descriptionIsRequiredLabel, 'error');
        this.resetSavingState();
        return;
    }
    
    const fields = {};
    fields['ContactId'] = this.contactId;
    fields['Application__c'] = this.selectedApplication ? this.selectedApplication : '';
    fields['OwnerId'] = USER_ID;
    fields['Origin'] = 'Scholarship Portal';
    fields['Status'] = 'New';
    fields['APFS_Raise_A_Query_Topic__c'] = this.selectedCaseTopic;
    fields['APFS_Raise_A_Query_Sub_Topic__c'] = this.selectedCaseSubTopic;
    fields['Subject'] = this.selectedCaseSubject;
    fields['Description'] = this.selectedCaseDescription;

    const recordInput = { apiName: CASE_OBJECT.objectApiName, fields };

    createRecord(recordInput)
        .then((caseRecord) => {
            this.showToast(sucessLabel,QUERY_SUCCESS_TOAST_MESSAGE, 'success');
            this.handleCloseModal();
            window.location.reload();
        })
        .catch((error) => {
            this.showToast('Error', error.body.message ? error.body.message : 'Failed to create Ticket', 'error');
        })
        .finally(() => {
            this.resetSavingState(); 
        });
}

resetSavingState() {
    this.isSaving = false;
}




// Show Toast
showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    }));
}

handleInput(event) {
    const maxLength = 75;
    const inputField = event.target;
    
    if (inputField.value.length > maxLength) {
        inputField.value = inputField.value.substring(0, maxLength);
    }
}


handleInputDescription(event) {
    const maxLength = 255;
    const inputField = event.target;
    
    if (inputField.value.length > maxLength) {
        inputField.value = inputField.value.substring(0, maxLength);
    }
}

}