/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 10-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement,api,wire } from 'lwc';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import basePath from '@salesforce/community/basePath';
import APPLICATION_EXTERNAL_STATUS from '@salesforce/schema/Application__c.Application_External_Status__c';

export default class ApfsCoShowPendingActions extends LightningElement {
    @api applicationId;
    externalStatus;
    actionName;

     // Define a mapping of statuses to action names
     externalStatusActionMap = {
        'Application Document Needs Resubmission': 'Resubmit Application Documents',
        'Offer Letter Issued': 'Accept Offer',
        'Offer Document Needs Resubmission': 'Resubmit Offer Documents'
    };


    /**
     * @description Fetches the application record and retrieves the external status.
     * Maps the external status to the corresponding action name.
     * If an error occurs, a toast is shown to notify the user.
     * 
     * @param {Object} error - The error response if the record retrieval fails.
     * @param {Object} data - The data response if the record retrieval is successful.
     */
    @wire(getRecord, { recordId: '$applicationId', fields: [APPLICATION_EXTERNAL_STATUS] })
    wiredPendingActions({ error, data }) {
        if (data) {
            // Get the external status and map it to the action name
            this.externalStatus = getFieldValue(data, APPLICATION_EXTERNAL_STATUS) || 'None';
            this.actionName = this.externalStatusActionMap[this.externalStatus] || 'None';
        } else if (error) {
            
            this.showToast('Error', 'Failed to load application status. Please reload!', 'error');
        }
    }

     /**
     * @description Determines whether the action name should be displayed as a link or as text.
     * @returns {Boolean} Returns true if the actionName is not 'None'.
     */
     get isActionAvailable() {
        return this.actionName !== 'None';
    }

     /**
     ** @description Redirects the user to the standard actions page and passes both applicationId and externalStatus as URL parameters.
     * Uses `window.location.href` for redirection, and constructs the URL using the basePath.
     */
     handlePendingAction() {
        if (!this.applicationId) {
            this.showToast('Error', 'Failed to load application details. Please reload the page.', 'error');
            return;
        }
          // Ensure externalStatus is not null or undefined
          const status = this.externalStatus ? this.externalStatus : 'None';

          // Construct the URL for the actions page with both applicationId and externalStatus as parameters
          const targetUrl = `${basePath}/actions?Id=${this.applicationId}&status=${encodeURIComponent(status)}`;
  
          // Redirect to the constructed URL in the same tab
          window.location.href = targetUrl;
    }

      /**
   * @description Displays a toast message.
   * @param {String} Title - The title of the toast message.
   * @param {String} Message - The detailed  message to be displayed.
   * @param {String} Variant - The variant type to be displayed.
   * @fires ShowToastEvent - Dispatches a toast event to show the message.
   */
  showToast(Title, Message,Variant) {
    const evt = new ShowToastEvent({
        title: Title,
        message: Message,
        variant: Variant
    });
    this.dispatchEvent(evt);
}
  
}