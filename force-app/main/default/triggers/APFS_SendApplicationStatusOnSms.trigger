/**
 * @description       : Trigger to handle sending SMS notifications when the application internal status changes.
 *                      This trigger is invoked after an update on the Application__c object.
 *                      The logic is delegated to the handler class for processing.
 * 
 * @trigger           : APFS_SendApplicationStatusOnSms
 * @trigger.event     : after update
 * @trigger.object    : Application__c
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 07-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * 
 * @handler           : APFS_SendApplicationStatusTriggerHandler
 * @exception         : APFS_CustomException if any error occurs during SMS processing.
 */
trigger APFS_SendApplicationStatusOnSms on Application__c (after update) {
    
    // Check if the trigger is invoked during an update operation
    if (Trigger.isUpdate) {
        /**
         * @description : Delegates the update processing logic to the handler class.
         *                The handler processes the application status changes and sends SMS notifications accordingly.
         * 
         * @param Trigger.new    : The new list of Application__c records after the update.
         * @param Trigger.oldMap : A map of old Application__c records keyed by Id before the update.
         */
        APFS_SendApplicationStatusTriggerHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
    }
}