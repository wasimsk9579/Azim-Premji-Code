/**
 * @description       : This trigger is responsible for sending the username via SMS when a user is created 
 *                      or when there is a profile change for the 'Scholarship Applicant Portal' profile during an update.
 *                      It delegates the logic to the trigger handler for insert and update operations.
 * 
 * @trigger           : APFS_SendUserNameAfterInsertAndUpdate
 * @trigger.object    : User
 * @trigger.event     : after insert, after update
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 29-09-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * 
 * @handler           : APFS_SendUserNameTriggerHandler
 * @Test Class        : APFS_SendUserNameAfterRegistrationTest
 */
trigger APFS_SendUserNameAfterRegistration on User (after insert) {
    
        // Handle user insert
        if (Trigger.isInsert) {
            APFS_SendUserNameTriggerHandler.handleAfterInsert(Trigger.new);
        }
     
}