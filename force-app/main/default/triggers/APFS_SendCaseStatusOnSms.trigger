/**
 * @description       : Sends an SMS notification to the contact when the status of a Case changes or a new Case is created.
 *                      This trigger handles both case creation (after insert) and case status updates (before update).
 *                      The logic is delegated to the trigger handler for processing.
 * 
 * @trigger           : APFS_SendCaseStatusOnSms
 * @trigger.object    : Case
 * @trigger.event     : before update, after insert
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 11-08-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * 
 * @handler           : APFS_SendCaseStatusTriggerHandler
 * @exception         : APFS_CustomException if any error occurs during the SMS notification process.
 * 
 * @Test Class        : APFS_SendCaseStatusOnSmsTest
 */
trigger APFS_SendCaseStatusOnSms on Case (before update, after insert) {

    // Check if the trigger is invoked during an update operation
    if (Trigger.isUpdate) {
        /**
         * @description : Delegates the case status update logic to the handler class.
         *                The handler processes the case status changes and sends SMS notifications to the contact.
         * 
         * @param Trigger.new    : The new list of Case records after the update.
         * @param Trigger.oldMap : A map of old Case records keyed by Id before the update.
         */
        APFS_SendCaseStatusTriggerHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
    }
    
    // Check if the trigger is invoked during an insert operation
    if (Trigger.isInsert) {
        /**
         * @description : Delegates the case creation logic to the handler class.
         *                The handler processes the new case creation and sends an SMS notification to the contact.
         * 
         * @param Trigger.new : The new list of Case records after the insert.
         */
        APFS_SendCaseStatusTriggerHandler.onAfterInsert(Trigger.new);
    }
}