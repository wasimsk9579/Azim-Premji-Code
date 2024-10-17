/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement, wire } from 'lwc';
import getActiveScholarships from '@salesforce/apex/APFS_ScholarshipController.getActiveScholarships';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApfsScholarshipApplication extends LightningElement {
    scholarships = [];


   @wire(getActiveScholarships)
   wiredScholarships({ error, data }) {
      if (data) {
         if (data.length > 0) {
            this.scholarships = data;
         }
         else {
            this.scholarships = '';
           }

      } else if (error) {
         this.showToast('Error',error.body.message?error.body.message:'Something went wrong.', 'error');
         this.scholarships = undefined;
      }
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