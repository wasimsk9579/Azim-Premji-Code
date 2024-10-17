/**
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 23-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * @description Trigger on Disbursement__c to handle updating Total Disbursed Amount
 * and Balance Amount fields based on insert, update, and delete operations.
 */

trigger DisbursementTotalsTrigger on Disbursement__c (after insert, after update, after delete) {
    // For insert and update events, handle the new disbursement records
    if (Trigger.isInsert || Trigger.isUpdate) {
        DisbursementTriggerHandler.handleAfterInsertUpdate(Trigger.new);
    }
    
    // For update and delete events, handle the old disbursement records
    if (Trigger.isDelete || Trigger.isUpdate) {
       DisbursementTriggerHandler.handleAfterDelete(Trigger.old);
    }
}