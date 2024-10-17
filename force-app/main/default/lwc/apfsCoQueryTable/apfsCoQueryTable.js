import { LightningElement,track,wire } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import { getRelatedListRecordsBatch } from 'lightning/uiRelatedListApi';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import { NavigationMixin } from "lightning/navigation";
import User_Manual_Hindi from '@salesforce/resourceUrl/User_Manual_Hindi';
import FAQ_English from '@salesforce/resourceUrl/Frequently_asked_Questions_in_English';

const USER_FIELDS = [
    CONTACT_ID_FIELD,
    ];


export default class ApfsCoQueryTable extends NavigationMixin(LightningElement) {
    @track userContactId;
    @track tableData = [];
    error;
    records;
    id;
    subject;
    number;
    status;
    dateCreated;
    comments;


    @wire(getRecord, { recordId: USER_ID, fields:USER_FIELDS})
    wiredUser({ error, data }) {
        if (data) {
            this.userContactId = getFieldValue(data, CONTACT_ID_FIELD); 
             
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }
    
     @wire(getRelatedListRecordsBatch, {
        parentRecordId: '$userContactId',
        relatedListParameters: [
            {
                relatedListId: 'Cases',
                fields: ['Case.Id','Case.CaseNumber','Case.Subject','Case.Status','Case.CreatedDate','Case.Comments__c'],
            }
         ]
    }) allListInfo({ error, data }) {
        if (data) {
            // Assuming data.results[0].result.records is an array
            this.records = data.results[0].result.records;
           
            
            this.tableData = this.records.map((record, index) => {
                
            
                
                const fields = record.fields; 

                return {
                    id: fields.Id ? fields.Id.value : 'N/A',
                    subject: fields.Subject ? fields.Subject.value : 'N/A',
                    number: fields.CaseNumber ? fields.CaseNumber.value : 'N/A',
                    status: fields.Status ? fields.Status.value : 'N/A',
                    dateCreated: fields.CreatedDate ? fields.CreatedDate.displayValue : 'N/A',
                    comments: fields.Comments__c ? fields.Comments__c.value : 'N/A',
                   
                };
            });
            

            

        } else if (error) {
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
        
        
    }
   
    
    handleQueryClick(event) {

        const caseId = event.currentTarget.dataset.id;
       
        this.navigateToCaseDetail(caseId);
        
    }

    handleFAQclick() {
        const link = document.createElement('a');
        link.href = FAQ_English;  
        link.download = 'FAQ English';  
        link.target = '_blank';  
        link.click();  
    }

    handleUserManualclick() {
        const link = document.createElement('a');
        link.href = User_Manual_Hindi;  
        link.download = 'User Manual';
        link.target = '_blank';  
        link.click();  
    }

    navigateToCaseDetail(caseId) {
       
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }
}