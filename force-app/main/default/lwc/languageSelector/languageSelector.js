/**
 * @description       : 
 * @author            : gurumohan.kollu@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id'; 
import USER_LANGUAGE_FIELD from '@salesforce/schema/User.LanguageLocaleKey'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class LanguageSelector extends LightningElement {
    @track selectedLanguage = '';
    languageOptions = [
        { label: 'English', value: 'en_US' },
        { label: 'Hindi', value: 'hi' }
    ];

    @wire(getRecord, { recordId: USER_ID, fields: [USER_LANGUAGE_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.selectedLanguage = data.fields.LanguageLocaleKey.value || 'en_US';
        } else if (error) {
            this.showToast('Error',error.body.message?error.body.message:'Something went wrong.', 'error');
        }
    }
    handleLanguageChange(event) {
        this.selectedLanguage = event.detail.value;
        this.updateLanguagePreference();
    }
    updateLanguagePreference() {
        const fields = {};
        fields.Id = USER_ID;
        fields[USER_LANGUAGE_FIELD.fieldApiName] = this.selectedLanguage;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
              
                window.location.reload();
            })
            .catch(error => {
                this.showToast('Error',error.body.message?error.body.message:'Something went wrong.', 'error');
            });
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(toastEvent);
    }
}